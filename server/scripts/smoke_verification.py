import argparse
import json
import os
import secrets
import string
from pathlib import Path

import requests


def _random_email() -> str:
    suffix = secrets.token_hex(4)
    return f"smoke_{suffix}@example.com"


def _random_password(length: int = 14) -> str:
    alphabet = string.ascii_letters + string.digits
    # keep it simple but non-trivial
    return "P@" + "".join(secrets.choice(alphabet) for _ in range(length - 2))


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test: registration + assessment + document verification")
    parser.add_argument("--base-url", default=os.getenv("AFRIVERIFY_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--doc-type", default="invoice")
    parser.add_argument("--file", default=None, help="Path to a file to upload. If omitted, creates a small temp file.")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")

    email = _random_email()
    password = _random_password()

    print(f"Base URL: {base_url}")
    print(f"Registering: {email}")

    # 1) Register
    register_payload = {"email": email, "password": password, "full_name": "Smoke Test User"}
    r = requests.post(f"{base_url}/auth/register", json=register_payload, timeout=30)
    if r.status_code != 200:
        print("Register failed:")
        print(r.status_code, r.text)
        return 1

    user = r.json()
    print(f"Registered user id: {user.get('id')}")

    # 2) Login to get token (OAuth2PasswordRequestForm)
    token_form = {"username": email, "password": password}
    r = requests.post(
        f"{base_url}/auth/token",
        data=token_form,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )
    if r.status_code != 200:
        print("Token failed:")
        print(r.status_code, r.text)
        return 1

    token = r.json().get("access_token")
    if not token:
        print("Token response missing access_token:")
        print(r.text)
        return 1

    headers = {"Authorization": f"Bearer {token}"}
    print("Got access token")

    # 3) Create assessment (needed for assessment_id)
    assessment_payload = {
        "product_name": "Test Product",
        "hs_code": "0101.21",
        "destination_country": "ZA",
        "ex_works_price": 100.0,
        "nom_value": 40.0,
    }
    r = requests.post(f"{base_url}/assessments/calculate", json=assessment_payload, headers=headers, timeout=30)
    if r.status_code != 200:
        print("Assessment failed:")
        print(r.status_code, r.text)
        return 1

    assessment = r.json()
    assessment_id = assessment.get("id")
    print(f"Created assessment id: {assessment_id}")

    # 4) Upload a document; backend simulates VERIFIED status.
    upload_path: Path
    if args.file:
        upload_path = Path(args.file)
    else:
        upload_path = Path(__file__).with_name("_smoke_upload.txt")
        upload_path.write_text("Smoke test upload\n", encoding="utf-8")

    if not upload_path.exists():
        print(f"Upload file not found: {upload_path}")
        return 1

    with upload_path.open("rb") as f:
        files = {"file": (upload_path.name, f)}
        data = {"doc_type": args.doc_type, "assessment_id": str(assessment_id)}
        r = requests.post(f"{base_url}/documents/upload", headers=headers, files=files, data=data, timeout=60)

    if r.status_code != 200:
        print("Upload failed:")
        print(r.status_code, r.text)
        return 1

    doc = r.json()
    print("Upload response:")
    print(json.dumps({k: doc.get(k) for k in ("id", "file_name", "doc_type", "status", "assessment_id", "ai_metadata")}, indent=2))

    # 5) List documents to verify it is persisted
    r = requests.get(f"{base_url}/documents/", headers=headers, timeout=30)
    if r.status_code != 200:
        print("List documents failed:")
        print(r.status_code, r.text)
        return 1

    docs = r.json()
    print(f"Documents in account: {len(docs)}")

    status = str(doc.get("status") or "").strip().lower()
    if status != "verified":
        print(f"Unexpected status (expected verified): {status}")
        return 2

    print("OK: document marked verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
