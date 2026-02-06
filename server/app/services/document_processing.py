import json
import re
from typing import Any, Optional

from app import models


def _clean(s: Optional[str]) -> str:
    return (s or "").strip()


def _has_any(text: str, needles) -> bool:
    t = (text or "").lower()
    return any(str(n).lower() in t for n in needles)


def verify_invoice(file_path: str) -> tuple[models.DocStatus, dict[str, Any], str | None, str]:
    from app.services.ocr_invoice import extract_text, parse_fields

    extracted_text, provider = extract_text(file_path)
    fields = parse_fields(extracted_text)

    has_text = bool(extracted_text and extracted_text.strip())
    ok = bool(fields.get("country")) and (fields.get("price") is not None)

    status = models.DocStatus.VERIFIED if (has_text and ok) else models.DocStatus.PENDING
    note = "Invoice verified (total + origin extracted)." if status == models.DocStatus.VERIFIED else "Invoice needs numeric total and country of origin."
    return status, fields, provider, note


def verify_supplier_declaration_text(text: str) -> tuple[models.DocStatus, dict[str, Any], str]:
    t = text or ""

    supplier = None
    product = None
    declared_country = None

    m = re.search(r"\bsupplier\s*[:\-]\s*(.+)$", t, re.IGNORECASE | re.MULTILINE)
    if m:
        supplier = _clean(m.group(1))[:120]

    m = re.search(r"\bproduct\s*[:\-]\s*(.+)$", t, re.IGNORECASE | re.MULTILINE)
    if m:
        product = _clean(m.group(1))[:120]

    m = re.search(r"\b(?:produced|manufactured|processed)\s+(?:in|from)\s+([A-Za-z][A-Za-z ]{2,40})\b", t, re.IGNORECASE)
    if m:
        declared_country = _clean(m.group(1))[:60]

    looks_like = _has_any(t, ["supplier declaration"]) or (_has_any(t, ["supplier:"]) and _has_any(t, ["declaration"]))
    signed = _has_any(t, ["signed", "signature", "________________", "date:"])
    has_declare_words = _has_any(t, ["declare", "certify", "we declare", "we certify"])

    ok = looks_like and signed and has_declare_words and bool(product or supplier)
    status = models.DocStatus.VERIFIED if ok else models.DocStatus.PENDING
    note = "Supplier declaration verified." if status == models.DocStatus.VERIFIED else "Supplier declaration missing signature/declaration details."

    return status, {"supplier": supplier, "product": product, "declared_country": declared_country}, note


def verify_direct_transport_text(text: str) -> tuple[models.DocStatus, dict[str, Any], str]:
    t = text or ""

    disqualifying = _has_any(t, ["transshipment issue", "repacked", "not under customs control", "altered"])
    if disqualifying:
        return models.DocStatus.REJECTED, {}, "Direct transport evidence indicates a potential disqualifying transit/transshipment."

    looks_like = _has_any(t, ["bill of lading", "air waybill", "direct transport"])

    pol = None
    pod = None

    m = re.search(r"\bport\s+of\s+loading\s*[:\-]\s*(.+)$", t, re.IGNORECASE | re.MULTILINE)
    if m:
        pol = _clean(m.group(1))[:120]

    m = re.search(r"\bport\s+of\s+discharge\s*[:\-]\s*(.+)$", t, re.IGNORECASE | re.MULTILINE)
    if m:
        pod = _clean(m.group(1))[:120]

    has_route = _has_any(t, ["routing", "direct", "under customs control", "airport of departure", "airport of destination"]) 

    ok = looks_like and has_route and bool(pol or pod)
    status = models.DocStatus.VERIFIED if ok else models.DocStatus.PENDING
    note = "Direct transport evidence verified." if status == models.DocStatus.VERIFIED else "Direct transport evidence missing routing/loading/discharge details."

    return status, {"port_of_loading": pol, "port_of_discharge": pod}, note


def build_ai_metadata(*, provider: str | None, fields: dict[str, Any], note: str, extracted_text: str | None = None) -> str:
    excerpt = ""
    if extracted_text:
        excerpt = (extracted_text[:2000] + "…") if len(extracted_text) > 2000 else extracted_text

    return json.dumps(
        {
            "ocr_provider": provider,
            "extracted_fields": fields,
            "extracted_text_excerpt": excerpt,
            "zuri_note": note,
        }
    )
