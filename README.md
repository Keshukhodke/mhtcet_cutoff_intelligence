# 🎓 ML-Powered MHT-CET College Cutoff Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TailwindCSS-61DAFB.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An end-to-end Machine Learning intelligence platform and admission decision-support system for **Maharashtra State Common Entrance Test (MHT-CET) Centralized Admission Process (CAP)** engineering admissions.

The system combines multi-year historical CAP data (2022–2026), AI branch intake analysis, ensemble machine learning models, and a modern interactive web dashboard to provide accurate cutoff predictions, reachability categorization, and smart preference list optimization for engineering aspirants.

---

## 🌟 Key Features

### 🤖 Machine Learning & Intelligence
- **Calibrated Blended Ensemble Model:** Combines **Random Forest (55%)** and **Extra Trees (45%)** regressors with systematic residual calibration.
- **High-Accuracy for Top Tier:** Delivers **93.41% accuracy within ±5 percentile points** on elite Maharashtra engineering institutes (COEP, VJTI, SPIT, PICT, Walchand, etc.).
- **Dynamic Branch Intake Factors:** Integrates capacity expansion signals, branch intake fluctuations, and quota adjustments directly into the prediction pipeline.
- **Reachability Engine:** Automatically classifies college-branch options into **Safe**, **Target**, and **Dream** bands based on confidence intervals and student score.

### 💻 Interactive Modern Frontend (React + Vite + TailwindCSS)
- 🎯 **College Predictor:** Real-time percentile & merit rank cutoff prediction filtered by category, branch, district, and round.
- 📊 **Historical Trends & Analyzer:** Multi-year CAP cutoff movements visualized across rounds (CAP-I, CAP-II, CAP-III).
- 🏆 **Top Colleges Explorer:** Comprehensive directory with NAAC/NBA accreditations, intake capacity, and historical cutoff benchmarks.
- 📋 **Preference Builder & Health Check:** Interactive option form builder with automated risk assessment and health checks to ensure well-hedged admission strategies.
- 🔮 **Cutoff Forecasts:** AI-forecasted cutoffs for the upcoming CAP 2026 round.

---

## 🏗️ System Architecture

```text
├── data/
│   ├── raw/                           # Raw multi-year CAP cutoff PDFs / consolidated CSVs
│   ├── intake/                        # Seat matrix & branch intake historical datasets
│   ├── intermediate/                  # Sanitized datasets during validation steps
│   └── final/
│       └── master_cap_cutoff_final.csv# Cleaned master dataset (397,000+ verified records)
│
├── frontend/                          # Web application (React 18 + Vite + TypeScript)
│   ├── src/
│   │   ├── features/                  # Predictor, Explorer, Preference Builder, Trends, etc.
│   │   ├── components/                # Modular UI layout & common components
│   │   └── services/                  # Prediction engine and JSON client services
│   └── public/data/                   # Optimized lookup datasets (branchIntake, predictorData)
│
├── models/                            # Trained machine learning model artifacts
│   ├── rf_model.joblib                # Random Forest model
│   ├── et_model.joblib                # Extra Trees model
│   ├── preprocessor.joblib            # One-Hot and scaling pipelines
│   ├── category_medians.json          # Category-level fallback benchmarks
│   └── model_metadata.json            # Model parameters and evaluation metrics
│
├── reports/                           # Analysis reports & data quality audit logs
│   ├── branch_intake_trend_analysis_report.md
│   └── intake_data_quality_report.md
│
├── src/
│   ├── intake/                        # Seat matrix & branch intake scrapers and transformers
│   └── models/                        # Model training and calibration pipelines
│
├── ML_Algorithm.ipynb                 # EDA, exploratory models, and model comparison notebook
└── generate_project_report.py         # Automated executive docx report generator
```

---

## 📈 Model Performance & Evaluation

The ensemble pipeline was evaluated on test partitions spanning diverse categories (OPEN, OBC, SC, ST, EWS, TFWS, PWD) and seat types across all Maharashtra engineering institutes:

| Metric | Blended Ensemble (RF + ET) | Single Random Forest | Linear Baseline |
| :--- | :---: | :---: | :---: |
| **$R^2$ Score** | **0.653** | 0.612 | 0.448 |
| **MAE (Mean Absolute Error)** | **9.91** | 10.42 | 14.20 |
| **MedAE (Median Absolute Error)** | **5.89** | 6.45 | 9.80 |
| **Accuracy (Within ±5% on Elite Institutes)** | **93.41%** | 90.15% | 76.50% |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend & ML Environment Setup

Clone the repository and install required Python packages:

```bash
git clone https://github.com/Keshukhodke/ML-Powered-MHT-CET-College-Cutoff-Intelligence-Platform.git
cd ML-Powered-MHT-CET-College-Cutoff-Intelligence-Platform

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt # or pip install pandas numpy scikit-learn joblib matplotlib seaborn
```

To re-train the models or generate new predictor datasets:
```bash
# Train the improved ensemble pipeline
python src/models/train_improved_pipeline.py

# Generate public frontend predictor lookup data
python generate_predictor_dataset.py
```

---

### 2. Frontend Dashboard Setup

Run the interactive dashboard locally:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 Data Pipeline & Integrity

The cutoff pipeline implements rigorous multi-stage data curation:
1. **Source-Level Category Recovery:** Employs localized `ffill()` and `bfill()` on bounded `[college, branch, seat_section]` boundaries to restore damaged PDF table headers.
2. **Branch Standardizer:** Maps disparate historical branch nomenclatures into canonical engineering disciplines.
3. **Automated Quarantine Engine:** Mathematically impossible records (`Percentile > 100`, `Rank <= 0`) are filtered into segregated audit logs.
4. **Intake Fusion:** Aligns Directorate of Technical Education (DTE) seat matrices with CAP cutoff records to incorporate capacity growth signals into prediction algorithms.

---

## 🤝 Contributing

Contributions, feedback, and suggestions are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
