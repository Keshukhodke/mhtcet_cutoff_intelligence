# CETCompass AI — Branch-Wise Intake Intelligence Datasets

This directory contains the official, verified, multi-year intake capacity datasets for engineering institutes participating in the Maharashtra Centralized Admission Process (CAP) across academic years **2024–25**, **2025–26**, and **2026–27**.

> **Audit Guarantee:** The original cutoff dataset `data/final/master_cap_cutoff_final.csv` has remained completely isolated and untouched.

---

## 📁 Directory Structure

```text
data/intake/
│
├── branch_intake_master.csv       # Canonical long-format dataset (11,956 records)
├── branch_intake_analysis.xlsx     # 6-sheet formatted analysis workbook (with formulas & styles)
├── branch_intake_features.csv     # Leak-free ML feature matrix (6,551 records)
│
├── raw/                           # Permanent cache of official downloaded HTML pages
│   ├── institute_list_2024.html   # 2024 directory portal page
│   ├── institute_list_2025.html   # 2025 directory portal page
│   ├── institute_list_2026.html   # 2026 directory portal page
│   ├── directory_institutes.csv   # Consolidated directory metadata
│   ├── 2024/                      # 355 cached institute detail pages
│   ├── 2025/                      # 373 cached institute detail pages
│   └── 2026/                      # 388 cached institute detail pages
│
└── README.md                      # This documentation
```

---

## 📊 Dataset Schemas & Resolved Inconsistencies

### 1. Master Dataset: `branch_intake_master.csv`
- **Total Records:** 11,956 rows
- **Breakdown by Year:**
  - *2024–25*: 2,081 Approved + 1,523 TFWS = **3,604 rows**
  - *2025–26*: 2,202 Approved + 1,819 TFWS = **4,021 rows**
  - *2026–27*: 2,340 Approved + 1,991 TFWS = **4,331 rows**
- **Grain:** Unique `(academic_year, choice_code)`
- **Leading Zero Integrity:** `institute_code` is formatted as a 5-digit string (e.g., `"01002"`, `"16006"`), `branch_code` is formatted as a 3-digit string (e.g., `"002"`, `"011"`, `"191"`), and all text columns are quoted (`csv.QUOTE_NONNUMERIC`).

### 2. Analysis Workbook: `branch_intake_analysis.xlsx`
Contains 6 structured worksheets:
1. `Branch_Intake_Master`: The full long-format master records. All code columns formatted strictly as Text (`@`).
2. `Institute_Intake_Summary`: Institutional year-wise approved, TFWS, and combined total quotas with separate, unambiguous change columns:
   - Approved Changes: `approved_change_24_to_25_abs`, `approved_growth_24_to_25_pct`, etc.
   - TFWS Changes: `tfws_change_24_to_25_abs`, `tfws_change_25_to_26_abs`, etc.
   - Combined Total Changes: `combined_total_change_24_to_25_abs`, `combined_total_growth_24_to_25_pct`, etc.
3. `Branch_Trend_Analysis`: Institute + branch combinations across years. Includes:
   - Observation status flags: `status_2024_25`, `status_2025_26`, `status_2026_27` (`OFFERED` vs `NOT_OFFERED`)
   - Granular trend classifications: `STABLE`, `EXPANDING`, `CONTRACTING`, `NEW_INSTITUTE_PROGRAM`, `NEW_BRANCH_IN_ACTIVE_INSTITUTE`, `DISCONTINUED_IN_ACTIVE_INSTITUTE`, `INSTITUTE_UNOBSERVED_IN_NEWER_YEAR`.
4. `Statewide_Branch_Summary`: Macro state-level totals per branch and branch family.
5. `Data_Quality_Checks`: 10-point mathematical audit report.
6. `Source_Registry`: Official URLs, download timestamps, and publishing authorities.

### 3. ML Feature Matrix: `branch_intake_features.csv`
- **Total Records:** 6,551 rows
- **Grain:** Unique `(academic_year, institute_code, branch_code)` for approved intake.
- **Identifiers:** String formatted `institute_code` (5-char) and `branch_code` (3-char) with quotes to guarantee zero data type truncation.

---

## 🛠️ Pipeline Reproduction Instructions

All scripts are located in `src/intake/` and can be run sequentially:

```bash
# Step 1: Scrape official portals and cache HTML pages locally
python src/intake/extract_intake.py

# Step 2: Standardize codes, assign branch families, and generate master dataset
python src/intake/build_master_intake.py

# Step 3: Compute trends, export 6-sheet Excel workbook, and build ML feature matrix
python src/intake/generate_analysis_and_features.py
```
