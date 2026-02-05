import os
import re
from typing import Any, Optional


def _clean_text(text: str) -> str:
    return "\n".join([line.strip() for line in (text or "").splitlines() if line.strip()])


def extract_text(file_path: str) -> tuple[str, str]:
    """Extract text from an invoice file.

    Returns (extracted_text, provider)

    Provider is one of: 'pypdf', 'tesseract', 'none'
    """

    ext = os.path.splitext(file_path)[1].lower()

    # PDFs: prefer embedded text extraction first
    if ext == ".pdf":
        try:
            from pypdf import PdfReader

            reader = PdfReader(file_path)
            pages = []
            for page in reader.pages:
                pages.append(page.extract_text() or "")
            text = _clean_text("\n".join(pages))
            if text:
                return text, "pypdf"
        except Exception:
            pass

    try:
        from PIL import Image
        import pytesseract

        tcmd = os.getenv("TESSERACT_CMD")
        if tcmd:
            pytesseract.pytesseract.tesseract_cmd = tcmd

        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        text = _clean_text(text)
        if text:
            return text, "tesseract"
    except ImportError:
        # pillow/pytesseract not installed
        return "", "none"
    except Exception:
        return "", "none"

    return "", "none"


def parse_fields(extracted_text: str) -> dict[str, Any]:
    """Best-effort invoice field extraction.

    Contract minimum: item_name, price, country.
    """

    text = extracted_text or ""

    # Country of origin / country
    country: Optional[str] = None
    m = re.search(r"(?:country\s+of\s+origin|origin\s+country|country)\s*[:\-]?\s*([A-Za-z][A-Za-z\s]{2,40})", text, re.IGNORECASE)
    if m:
        country = m.group(1).strip()

    # Price: try 'total'/'amount due' first
    price: Optional[float] = None
    m = re.search(r"(?:total\s+amount|amount\s+due|grand\s+total|total)\s*[:\-]?\s*([0-9][0-9,]*\.?[0-9]{0,2})", text, re.IGNORECASE)
    if m:
        try:
            price = float(m.group(1).replace(",", ""))
        except Exception:
            price = None

    # Fallback: pick the largest money-looking number
    if price is None:
        nums = []
        for nm in re.findall(r"\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)\b", text):
            try:
                nums.append(float(nm.replace(",", "")))
            except Exception:
                continue
        if nums:
            price = max(nums)

    # Item name: first non-trivial line after a 'description' header, else first meaningful line
    item_name: Optional[str] = None
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if lines:
        desc_idx = None
        for i, ln in enumerate(lines[:80]):
            if re.search(r"\b(description|item\s+description|goods\s+description)\b", ln, re.IGNORECASE):
                desc_idx = i
                break
        if desc_idx is not None:
            for ln in lines[desc_idx + 1 : desc_idx + 8]:
                if len(ln) >= 4 and not re.search(r"\b(qty|quantity|unit\s*price|amount|total)\b", ln, re.IGNORECASE):
                    item_name = ln
                    break

        if not item_name:
            for ln in lines[:15]:
                if len(ln) >= 4 and not re.search(r"\b(invoice|bill\s+to|ship\s+to|date|total|amount)\b", ln, re.IGNORECASE):
                    item_name = ln
                    break

    return {
        "item_name": item_name,
        "price": price,
        "country": country,
    }
