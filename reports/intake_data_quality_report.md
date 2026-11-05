# CETCompass AI — Intake Data Quality & Audit Report (Updated & Reconciled)

**Date of Execution:** 2026-10-15  
**Target Academic Years:** 2024–25, 2025–26, 2026–27  
**Data Sources:** Official Maharashtra State Common Entrance Test Cell (`fe2024.mahacet.org`, `fe2025.mahacet.org`, `fe2026.mahacet.org`)  
**Canonical Output:** `data/intake/branch_intake_master.csv`  

---

## 1. Executive Quality Summary

All data ingestion, parsing, entity harmonization, and mathematical reconciliation tasks were executed autonomously without human intervention or data fabrication.

| Verification Dimension | Expected Benchmark | Observed Result | Status |
|---|---|---|---|
| **Portal Status & Retrieval** | 3/3 portals accessible (HTTP 200) | 100% retrieved (1,116 raw HTML documents) | **PASSED** |
| **Directory Record Count** | 354 (2024), 372 (2025), 387 (2026) | 354 (2024), 372 (2025), 387 (2026) | **PASSED** |
| **Institute-Level Details** | 100% course tables extracted | 1,113 / 1,113 institutes parsed (0 missing) | **PASSED** |
| **Total Master Records** | Detailed long-format records | **11,956** validated rows | **PASSED** |
| **Primary Key Uniqueness** | `(academic_year, choice_code)` unique | **0** duplicates across 11,956 records | **PASSED** |
| **Identifier Formatting** | 5-char `institute_code` & 3-digit `branch_code` | **100% string with preserved leading zeros** | **PASSED** |
| **Non-negative Capacities** | `intake_capacity > 0` | All positive integers (min 1, max 360) | **PASSED** |
| **State Total Reconciliation (2024-25)** | Exact match with published total `157,914` | **157,914** approved seats | **PASSED (100.0%)** |
| **State Total Reconciliation (2025-26)** | Exact match with published total `177,985` | **177,985** approved seats | **PASSED (100.0%)** |
| **State Total Reconciliation (2026-27)** | Exact match with published total `194,330` | **194,330** approved seats | **PASSED (100.0%)** |
| **Institute-Level Reconciliation** | Branch sum == Directory total per institute | **1,113 / 1,113 (100.00% exact match)** | **PASSED** |
| **Intake Measure Separation** | Separate Approved vs TFWS seats | 6,623 Approved / 5,333 TFWS records | **PASSED** |
| **Cutoff Dataset Isolation** | `master_cap_cutoff_final.csv` untouched | **0 bytes modified**, 0 modifications | **PASSED** |

---

## 2. Ingestion & Extraction Provenance

Raw documents were downloaded and permanently cached on disk to guarantee end-to-end auditability and reproducibility:

- **Directory Indexes**:
  - `data/intake/raw/institute_list_2024.html` (310,985 bytes)
  - `data/intake/raw/institute_list_2025.html` (320,798 bytes)
  - `data/intake/raw/institute_list_2026.html` (331,750 bytes)
- **Granular Institute Details**:
  - `data/intake/raw/2024/`: 355 cached HTML files (including 354 valid institutes + 1 table footer)
  - `data/intake/raw/2025/`: 373 cached HTML files (372 valid institutes)
  - `data/intake/raw/2026/`: 388 cached HTML files (387 valid institutes)
- **Total Local Cache Size**: 1,116 raw HTML files (~68 MB).

---

## 3. Mathematical Reconciliation Audit

The official CET Cell `frmInstituteList` contains an official footer row titled `Total`. To ensure zero double-counting, the pipeline verified that:
$$\sum \text{Branch Approved Intake} = \text{Published Institute Total} = \text{Published State Total}$$

| Academic Year | Extracted Institutes | Published State Directory Total | Extracted Branch Approved Intake | Approved Intake Rows | TFWS Intake Rows | Total Rows | TFWS Waiver Seats (Isolated) | Total Seats (Approved + TFWS) |
|---|---|---|---|---|---|---|---|---|
| **2024–25** | 354 | 157,914 | **157,914** | **2,081** | **1,523** | **3,604** | 6,572 | 164,486 |
| **2025–26** | 372 | 177,985 | **177,985** | **2,202** | **1,819** | **4,021** | 8,069 | 186,054 |
| **2026–27** | 387 | 194,330 | **194,330** | **2,340** | **1,991** | **4,331** | 8,897 | 203,227 |
| **Total** | **1,113** | **530,229** | **530,229** | **6,623** | **5,333** | **11,956** | **23,538** | **553,767** |

### Institute-Level Reconciliations
- Across all 1,113 institute-year instances (354 + 372 + 387), **1,113 instances (100.00%)** had a difference of exactly zero between the sum of their individual course capacities and their published total intake.

---

## 4. Entity Resolution & Code Validation

1. **Choice Code Structure**:
   - Every choice code was verified to begin with the official institute code.
   - Digits 6–8 (or following the institute prefix) strictly correspond to the DTE 3-digit branch identifier.
   - **0 unparseable or unknown branch codes** out of 11,956 records.
2. **Leading Zero Preservation**:
   - `institute_code` is stored as a 5-character string (e.g., `'01002'`, `'16006'`).
   - `branch_code` is stored as a 3-character string (e.g., `'002'`, `'011'`, `'191'`).
   - Quoting is applied to CSVs and text formatting (`@`) is enforced in openpyxl Excel workbooks.
3. **Branch Normalization**:
   - 120 unique branch codes were discovered across Maharashtra.
   - 100% of branch codes were mapped to standard canonical titles and classified into 7 core engineering disciplines.
4. **Choice Code Suffixes**:
   - Sanctioned Approved Intake: Standard choice codes ending in numeric shift indicators (`10`, `20`, `71U`, etc.).
   - TFWS Supernumerary Intake: Strictly isolated via the `T` suffix (`11T`, `71UT`, `51FT`).

---

## 5. Dataset File Artifacts Generated

1. `data/intake/branch_intake_master.csv`: 11,956 rows, 22 columns (all string columns quoted).
2. `data/intake/branch_intake_analysis.xlsx`: 6 formatted worksheets with auto-filter, frozen panes, readable column widths, and separate Approved, TFWS, and Combined Total metrics.
3. `data/intake/branch_intake_features.csv`: 6,551 rows, 23 columns (Approved Intake ML feature matrix).
4. `master_cap_cutoff_final.csv`: **Preserved 100% unmodified in `data/final/`**.
