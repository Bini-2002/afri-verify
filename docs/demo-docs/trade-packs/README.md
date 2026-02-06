# Afri-Verify Demo Trade Packs (TXT)

These packs are designed to stress-test the MVP eligibility flow using different products, routes, invoice formats, and outcomes.

## How to run each pack (same flow every time)
1. Start API (`Server: Run API (uvicorn)`) and Client (`npm run dev`).
2. In the app, go to **Shipment Details** and create a **new assessment** using the pack’s inputs.
3. Go to **Trade Action** for that assessment.
4. Upload the three evidence documents (Step 2):
   - Supplier Declaration
   - Direct Transport (Bill of Lading)
   - Commercial Invoice
5. Click **Finalize with Zuri AI** (Step 4).
6. Read the **Zuri Guidance** panel (no prompts) and the **Evidence Summary**.
7. If eligible, open the certificate.

Notes:
- Your system marks an invoice `VERIFIED` only when it extracts **Country of Origin**, **Invoice Total**, and **Cost Breakdown (EXW + NOM)**.
- If VA < 40%, the assessment is `INELIGIBLE` even with perfect documents.
- If any required document is `REJECTED` (technical issue), the assessment is `INELIGIBLE`.
- Chat is optional and gated to avoid consuming limited prompts.

---

## Pack 01 — Shea Butter (Eligible)
**Goal:** Standard eligible flow; tests `Invoice Total` + `Country of Origin` parsing.
- RoO Calculator:
  - Product: `Shea Butter`
  - Destination: `Kenya`
  - EXW: `10000`
  - NOM: `2000`
- Upload files:
  - `pack01_shea_butter_ghana_kenya/supplier_declaration.txt`
  - `pack01_shea_butter_ghana_kenya/direct_transport_bill_of_lading.txt`
  - `pack01_shea_butter_ghana_kenya/commercial_invoice_verified.txt`
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 02 — Roasted Coffee (Eligible)
**Goal:** Tests `Amount Due` total parsing + `Origin Country` keyword.
- RoO Calculator:
  - Product: `Roasted Coffee`
  - Destination: `South Africa`
  - EXW: `12000`
  - NOM: `3000`
- Upload files:
  - `pack02_roasted_coffee_kenya_south_africa/supplier_declaration.txt`
  - `pack02_roasted_coffee_kenya_south_africa/direct_transport_air_waybill.txt`
  - `pack02_roasted_coffee_kenya_south_africa/commercial_invoice_verified_amount_due.txt`
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 03 — Cotton T-Shirts (Eligible)
**Goal:** Tests `Total Amount` parsing and multi-line description extraction.
- RoO Calculator:
  - Product: `Cotton T-Shirts`
  - Destination: `Rwanda`
  - EXW: `15000`
  - NOM: `8000`  (VA ~ 46.7%)
- Upload files:
  - `pack03_cotton_tshirts_egypt_rwanda/supplier_declaration.txt`
  - `pack03_cotton_tshirts_egypt_rwanda/direct_transport_transit_under_customs_control.txt`
  - `pack03_cotton_tshirts_egypt_rwanda/commercial_invoice_verified_total_amount.txt`
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 04 — Paracetamol Tablets (Eligible)
**Goal:** Tests `Grand Total` parsing and `Country of Origin (Manufacture)` pattern.
- RoO Calculator:
  - Product: `Paracetamol Tablets`
  - Destination: `Ghana`
  - EXW: `9000`
  - NOM: `3500`
- Upload files:
  - `pack04_paracetamol_nigeria_ghana/supplier_declaration.txt`
  - `pack04_paracetamol_nigeria_ghana/direct_transport_bill_of_lading.txt`
  - `pack04_paracetamol_nigeria_ghana/commercial_invoice_verified_grand_total.txt`
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 05 — Solar Panels (Ineligible)
**Goal:** Forces VA < 40% and confirms the terminal `INELIGIBLE` decision.
- RoO Calculator:
  - Product: `Solar Panels`
  - Destination: `Senegal`
  - EXW: `10000`
  - NOM: `7500`  (VA = 25%)
- Upload files:
  - `pack05_solar_panels_morocco_senegal/supplier_declaration.txt`
  - `pack05_solar_panels_morocco_senegal/direct_transport_bill_of_lading.txt`
  - `pack05_solar_panels_morocco_senegal/commercial_invoice_verified.txt`
- Expected:
  - Final decision: **Ineligible** (even if documents verify).

## Pack 06 — Cashew Kernels (Action Required → Fix)
**Goal:** Keeps VA eligible but invoice remains `PENDING` because **country is missing**.
- RoO Calculator:
  - Product: `Cashew Kernels`
  - Destination: `Tunisia`
  - EXW: `14000`
  - NOM: `4000`
- Upload files (first pass):
  - `pack06_cashew_kernels_civ_tunisia/supplier_declaration.txt`
  - `pack06_cashew_kernels_civ_tunisia/direct_transport_bill_of_lading.txt`
  - `pack06_cashew_kernels_civ_tunisia/commercial_invoice_action_required_missing_country.txt`
- Click **Finalize with Zuri AI**.
- Expected:
  - Final decision: **Action Required**
  - Guidance highlights missing **Country of Origin** on the invoice.

**Fix step (second pass):**
- Upload: `pack06_cashew_kernels_civ_tunisia/commercial_invoice_fix_verified.txt`
- Click **Finalize with Zuri AI** again.
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 08 — Textiles (Eligible via Cost Breakdown)
**Goal:** Eligible flow using OCR-extracted Cost Breakdown (EXW + NOM). VA% is computed by the system.
- RoO Calculator: (optional — can create any assessment, OCR values overwrite during finalize)
- Upload files:
  - `pack08_textiles_uganda_egypt/supplier_declaration.txt`
  - `pack08_textiles_uganda_egypt/direct_transport_bill_of_lading.txt`
  - `pack08_textiles_uganda_egypt/commercial_invoice_eligible.txt`
- Expected:
  - Final decision: **Eligible** → Certificate available.

## Pack 09 — Coffee (Action Required: EXW missing)
**Goal:** Invoice is missing Ex-Works Price (EXW) line; system cannot compute VA%.
- Upload files:
  - `pack09_coffee_kenya_algeria/supplier_declaration.txt`
  - `pack09_coffee_kenya_algeria/direct_transport_air_waybill.txt`
  - `pack09_coffee_kenya_algeria/commercial_invoice_missing_exw.txt`
- Expected:
  - Final decision: **Action Required** (invoice pending; cost breakdown incomplete).

## Pack 10 — Cocoa Beans (Action Required: NOM missing)
**Goal:** Invoice is missing Non-Originating Materials (NOM) line.
- Upload files:
  - `pack10_cocoa_beans_ghana_morocco/supplier_declaration.txt`
  - `pack10_cocoa_beans_ghana_morocco/direct_transport_bill_of_lading.txt`
  - `pack10_cocoa_beans_ghana_morocco/commercial_invoice_missing_nom.txt`
- Expected:
  - Final decision: **Action Required**.

## Pack 11 — Solar Inverters (Ineligible: technical rejection)
**Goal:** Direct transport evidence contains a transshipment issue; transport is REJECTED.
- Upload files:
  - `pack11_solar_inverters_tanzania_rwanda/supplier_declaration.txt`
  - `pack11_solar_inverters_tanzania_rwanda/direct_transport_transshipment_issue.txt`
  - `pack11_solar_inverters_tanzania_rwanda/commercial_invoice_ok_but_technical_issue.txt`
- Expected:
  - Final decision: **Ineligible**.
