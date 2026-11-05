import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding for a cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    """Applies clean subtle borders to a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def create_report():
    doc = docx.Document()

    # 1. Page Setup: Standard Letter, 1-inch margins
    for section in doc.sections:
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base font setup
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(30, 30, 30)

    # ---------------------------------------------------------------------------
    # COVER PAGE
    # ---------------------------------------------------------------------------
    p_rep = doc.add_paragraph()
    p_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rep.paragraph_format.space_before = Pt(10)
    p_rep.paragraph_format.space_after = Pt(12)
    run_rep = p_rep.add_run("A Project Report on")
    run_rep.font.name = "Times New Roman"
    run_rep.font.size = Pt(14)
    run_rep.font.italic = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(20)
    run_title = p_title.add_run("“ML-Powered MHT-CET Engineering College Cutoff Intelligence Platform: Multi-Year Predictive Modeling and Decision-Support System”")
    run_title.font.name = "Times New Roman"
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    # Logo
    logo_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\ref_docx_images\image1.jpeg"
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(16)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.8))

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(4)
    p_sub.paragraph_format.space_after = Pt(2)
    run_sub = p_sub.add_run("Submitted to COEP Technological University, Pune\n(A Unitary Public University of Government of Maharashtra)")
    run_sub.font.name = "Times New Roman"
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_before = Pt(6)
    p_deg.paragraph_format.space_after = Pt(16)
    run_deg = p_deg.add_run("In Partial Fulfillment of the Requirements for the Award of\nMaster of Technology in Data Science")
    run_deg.font.name = "Times New Roman"
    run_deg.font.size = Pt(13)
    run_deg.font.italic = True

    # Submitted by & Guided by in clean two-column format or centered
    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_before = Pt(10)
    p_by.paragraph_format.space_after = Pt(4)
    run_by_title = p_by.add_run("Submitted By:\n")
    run_by_title.font.name = "Times New Roman"
    run_by_title.font.size = Pt(12)
    run_by_title.font.bold = True
    run_by_name = p_by.add_run("Keshav M. Khodke (MIS: 712652034)\n")
    run_by_name.font.name = "Times New Roman"
    run_by_name.font.size = Pt(13)
    run_by_name.font.bold = True

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(10)
    p_guide.paragraph_format.space_after = Pt(16)
    run_guide_title = p_guide.add_run("Under the Guidance of:\n")
    run_guide_title.font.name = "Times New Roman"
    run_guide_title.font.size = Pt(12)
    run_guide_title.font.bold = True
    run_guide_name = p_guide.add_run("Dr. Y. V. Haribhakta\nProfessor & Faculty Mentor")
    run_guide_name.font.name = "Times New Roman"
    run_guide_name.font.size = Pt(13)
    run_guide_name.font.bold = True

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(10)
    p_dept.paragraph_format.space_after = Pt(0)
    run_dept = p_dept.add_run("Department of Computer Science and Engineering\nCOEP Technological University, Shivajinagar, Pune — 411005\nMaharashtra, India\nAcademic Year (2026–2027)")
    run_dept.font.name = "Times New Roman"
    run_dept.font.size = Pt(12)
    run_dept.font.bold = True

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # TABLE OF CONTENTS
    # ---------------------------------------------------------------------------
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_body(text, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        return p

    def add_bullet(text):
        p = doc.add_paragraph(style='List Paragraph')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run("•  " + text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        return p

    def add_figure(img_path, caption, width_in=5.8):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(10)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.paragraph_format.keep_with_next = True
            r_img = p_img.add_run()
            r_img.add_picture(img_path, width=Inches(width_in))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(12)
            r_cap = p_cap.add_run(caption)
            r_cap.font.name = "Times New Roman"
            r_cap.font.size = Pt(10.5)
            r_cap.font.bold = True
            r_cap.font.color.rgb = RGBColor(70, 70, 70)

    # TOC
    add_h1("Table of Contents")
    toc_items = [
        ("1. Abstract", "3"),
        ("2. Introduction", "4"),
        ("    2.1 Background & Real-World Motivation", "4"),
        ("    2.2 Problem Formulation", "5"),
        ("    2.3 Project Objectives", "5"),
        ("    2.4 Scope & Operational Boundaries", "6"),
        ("3. Dataset Description & Engineering Architecture", "7"),
        ("    3.1 Data Architecture & Directory Hierarchy", "7"),
        ("    3.2 Multi-Year Data Dictionary & Schema", "8"),
        ("    3.3 Surgical Data Cleaning & Quarantine Engine", "9"),
        ("    3.4 Data Validation Criteria (17-Point Audit)", "10"),
        ("4. Methodology", "11"),
        ("    4.1 End-to-End Pipeline Workflow", "11"),
        ("    4.2 Tools, Libraries & Development Environment", "12"),
        ("    4.3 Feature Engineering & Domain Indicators", "13"),
        ("    4.4 Temporal Partitioning & Leakage Prevention", "14"),
        ("    4.5 Predictive Algorithms & Blended Ensemble Architecture", "15"),
        ("    4.6 Evaluation Metrics", "16"),
        ("5. Exploratory Data Analysis & Visualizations", "17"),
        ("    5.1 Historical Cutoff Distributions Across CAP Rounds", "17"),
        ("    5.2 Actual vs Predicted Cutoffs (Initial Linear Model)", "18"),
        ("    5.3 Best Model Validation & Reference Scatter", "19"),
        ("    5.4 Random Forest Regressor Evaluation", "20"),
        ("6. Model Development, Benchmark Results & Error Analysis", "21"),
        ("    6.1 Comparative Model Performance Benchmarks", "21"),
        ("    6.2 Prediction Accuracy Bands (Within ±1, ±2, ±5 Percentiles)", "22"),
        ("    6.3 Transition Shift Calibration Rationale (+5.30 Percentile)", "23"),
        ("    6.4 Micro-Quota Regularization for Underrepresented Categories", "24"),
        ("7. Feature Importance & Domain Factor Analysis", "25"),
        ("    7.1 Gini / MDI Feature Importance Hierarchy", "25"),
        ("    7.2 Analytical Interpretation of Admission Factors", "26"),
        ("8. Full-Stack Web Application & Decision-Support System", "27"),
        ("    8.1 Software Architecture & Interactive Modules", "27"),
        ("    8.2 Interactive Decision-Support & College Reachability Engine", "28"),
        ("    8.3 Sample Prediction Walkthrough", "29"),
        ("9. Limitations", "30"),
        ("10. Conclusion & Future Directions", "31"),
        ("11. References", "32"),
    ]

    for item, page in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        dots = " ." * int((60 - len(item)))
        r1 = p.add_run(item)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11.5)
        if not item.startswith("    "):
            r1.font.bold = True
        r2 = p.add_run(f" {dots} {page}")
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(11)
        r2.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 1. ABSTRACT
    # ---------------------------------------------------------------------------
    add_h1("1. Abstract")
    add_body(
        "Every academic year, over 300,000 engineering aspirants in Maharashtra participate in the Centralized "
        "Admission Process (CAP) conducted by the State Common Entrance Test Cell. Deciding college and branch options "
        "is fraught with anxiety due to high volatility in closing cutoff percentiles across admission rounds, shifting seat "
        "capacities, expanding autonomous institutions, and diverse reservation categories (GOPEN, LOPEN, OBC, SC, ST, EWS, TFWS, PWD, DEF). "
        "This project develops a comprehensive, production-grade Machine Learning Intelligence Platform to forecast "
        "prospective CAP round cutoffs and empower students with transparent, risk-calibrated college reachability insights."
    )
    add_body(
        "A multi-year dataset spanning 2022-2023 to 2026-2027 was compiled and normalized from official Directorate of Technical "
        "Education (DTE) reports, encompassing over 405,000 raw admission boundaries. A dedicated data engineering pipeline was built "
        "featuring group-limited forward/backward fill category recovery, standard branch code reconciliation, and an automated "
        "quarantine engine that validated 397,152 pristine records with zero missing values across critical fields. "
        "To prevent temporal lookahead leakage, models were strictly trained on historical years (< 2026) and evaluated out-of-time "
        "on 27,836 real competitive seat allocations in the 2026-2027 CAP Round 1."
    )
    add_body(
        "Multiple tree-based and gradient-boosted architectures were developed and bench-marked, including Random Forest, Extra Trees, "
        "and XGBoost. To overcome the structural percentile shift between the closing round of a previous academic year and the opening "
        "round of a new cycle, we designed a novel Calibrated Blended Ensemble (0.55 Random Forest + 0.45 Extra Trees) combined with an "
        "empirical +5.30 percentile transition adjustment and micro-quota shrinkage regularization for sparse categories. "
        "The proposed calibrated ensemble achieved a Mean Absolute Error (MAE) of 9.916 percentile points, Root Mean Squared Error (RMSE) "
        "of 14.508, and an R² of 0.6531, reducing extreme errors significantly. Furthermore, predictions falling within ±5 percentile points "
        "surged from 29.31% (baseline) to 45.13%."
    )
    add_body(
        "The analytical findings were deployed through a modern, responsive web application developed with React, TypeScript, and TailwindCSS, "
        "providing a Student Profile Wizard, Cutoff Intelligence Dashboard, Historical Trend Analyzer, and a Three-Tier Reachability "
        "Classification Engine (Safe, Moderate, Dream). This report presents the end-to-end mathematical methodology, data hygiene protocol, "
        "empirical benchmark evaluations, and decision-support architecture."
    )
    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(8)
    p_kw.paragraph_format.space_after = Pt(12)
    r_kwt = p_kw.add_run("Keywords: ")
    r_kwt.font.name = "Times New Roman"
    r_kwt.font.size = Pt(11.5)
    r_kwt.font.bold = True
    r_kw = p_kw.add_run("MHT-CET, Engineering Admission Cutoffs, Centralized Admission Process (CAP), Educational Data Mining, Random Forest, Extra Trees, Blended Ensemble, Transition Calibration, Decision Support System.")
    r_kw.font.name = "Times New Roman"
    r_kw.font.size = Pt(11.5)
    r_kw.font.italic = True

    # ---------------------------------------------------------------------------
    # 2. INTRODUCTION
    # ---------------------------------------------------------------------------
    add_h1("2. Introduction")
    add_h2("2.1 Background & Real-World Motivation")
    add_body(
        "The State Common Entrance Test Cell, Government of Maharashtra, conducts the Centralized Admission Process (CAP) "
        "for admissions into Bachelor of Engineering and Bachelor of Technology (B.E./B.Tech) programs across more than 350 government, "
        "government-aided, autonomous, and private unaided institutes. Following the announcement of MHT-CET examination percentiles, "
        "candidates must submit an Option Form prioritizing up to 300 college and branch combinations across successive rounds (CAP Round 1, 2, and 3)."
    )
    add_body(
        "In practice, students and parents face intense cognitive overload and anxiety during choice filing. Published cutoff PDFs are "
        "massive (spanning thousands of unstructured pages), highly fragmented by intricate reservation categories, and subject to dynamic "
        "shifts driven by expanding seat matrices (e.g., introduction of Artificial Intelligence, Data Science, and Cybersecurity branches) "
        "and changing student preferences. Without intelligent computational tools, students often make suboptimal option selections—either "
        "aiming too conservatively and missing out on premier institutes, or over-speculating on unreachable colleges and facing non-allotment."
    )

    add_h2("2.2 Problem Formulation")
    add_body(
        "Let a college option be characterized by institute identifier c in C, academic specialization branch b in B, seat quota category q in Q, "
        "and seat matrix intake capacity I in N. The goal is to formulate a robust regression function f that maps historical cutoff trajectories, "
        "institutional reputation baselines, and intake expansions to predict the prospective opening and closing cutoff percentile Y in [0, 100] "
        "for the upcoming CAP Round 1:"
    )
    add_body("            Y_target = f( Cutoff_{prev}, Intake_{current}, Delta_Intake, College_Avg, Cat, Branch, Quota ) + epsilon")
    add_body(
        "The primary computational challenge is multi-faceted: handling extreme sparsity in specialized reservation categories (e.g., PWD, DEF, TFWS), "
        "reconciling shifting institute affiliations, accounting for the inherent upward shift between the final round of the prior year and "
        "Round 1 of the new year, and ensuring zero data leakage in multi-year temporal pipelines."
    )

    add_h2("2.3 Project Objectives")
    add_body("To address these challenges rigorously, this project was executed under five core engineering objectives:")
    add_bullet("Data Engineering & Cleansing: Construct an end-to-end data pipeline to ingest, standardize, and surgically clean over 405,000 raw cutoff records across 2022 to 2026, establishing an audit-ready dataset.")
    add_bullet("Domain Feature Engineering: Derive domain-specific predictors capturing institutional baseline percentiles, absolute intake expansions, gender quotas, and reservation tier dynamics.")
    add_bullet("Leakage-Free Predictive Modeling: Formulate a strict out-of-time evaluation scheme (training on < 2026, testing on 2026-27 CAP1) and evaluate diverse regression algorithms (Random Forest, Extra Trees, XGBoost).")
    add_bullet("Transition Calibration & Quota Shrinkage: Design a post-model calibration formula to adjust for opening-round market inflation and regularize volatile minority categories.")
    add_bullet("Decision-Support Deployment: Build a responsive, user-friendly React and TypeScript web platform that transforms raw algorithmic forecasts into actionable admission safety tiers (Safe, Moderate, Dream).")

    add_h2("2.4 Scope & Operational Boundaries")
    add_body(
        "The scope of this project encompasses all undergraduate engineering and technology institutions regulated by DTE Maharashtra across the "
        "five-year continuum (2022-2023 through 2026-2027). The modeling targets CAP Round 1 cutoffs across all recognized quotas. "
        "The system does not predict individual student ranks from exam marks; rather, given a student's verified percentile and quota, "
        "it forecasts college cutoff boundaries to recommend optimal choice strategies."
    )

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 3. DATASET DESCRIPTION & ENGINEERING ARCHITECTURE
    # ---------------------------------------------------------------------------
    add_h1("3. Dataset Description & Engineering Architecture")
    add_h2("3.1 Data Architecture & Directory Hierarchy")
    add_body(
        "A rigorous, multi-tiered data storage architecture was implemented to prevent cross-contamination between raw, unparsed documents "
        "and clean modeling tables. The directory hierarchy is organized as follows:"
    )
    add_bullet("data/raw/ : Houses the pristine, untouched extracted CSV and Excel sheets directly parsed from DTE CAP allocation PDFs.")
    add_bullet("data/intermediate/ : Contains standardized merged tables used for iterative auditing, null detection, and boundary testing.")
    add_bullet("data/final/ : Houses master_cap_cutoff_final.csv (397,152 records), the surgically verified, production ML dataset.")
    add_bullet("data/quarantine/ : Segregates irrecoverable anomalies (e.g., Rank <= 0, corrupted text lines) for transparent audit trails.")

    add_h2("3.2 Multi-Year Data Dictionary & Schema")
    add_body("The unified dataset schema contains 12 core attributes capturing institutional, branch, quota, and percentile dimensions:")

    # Table 0: Data Schema
    table0 = doc.add_table(rows=1, cols=4)
    table0.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table0)
    hdr_cells0 = table0.rows[0].cells
    hdr_titles0 = ["Column Name", "Data Type", "Range / Format", "Semantic Description"]
    for i, title in enumerate(hdr_titles0):
        hdr_cells0[i].text = title
        set_cell_background(hdr_cells0[i], "1E3A8A")
        set_cell_margins(hdr_cells0[i], 120, 120, 150, 150)
        p = hdr_cells0[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    schema_rows = [
        ("academic_year", "String", "2022-2023 to 2026-2027", "Academic admission cycle"),
        ("cap_round", "Integer", "1, 2, 3, 4", "Centralized Admission Process round number"),
        ("college_code", "Integer", "1002 to 6982", "Four-digit DTE institute identification code"),
        ("college_name", "String", "Alphanumeric text", "Official full name of the engineering college"),
        ("branch_code", "Integer", "9-digit integer", "Unique DTE program code (e.g., 617524510)"),
        ("branch_name", "String", "Text", "Standard engineering discipline specialization name"),
        ("seat_section", "String", "State / Home Univ / AI", "Jurisdiction category for seat allotment"),
        ("category", "String", "GOPEN, LOPEN, OBC, etc.", "Reservation and quota classification"),
        ("merit_rank", "Integer", "1 to 200,000+", "State merit ranking corresponding to closing cutoff"),
        ("percentile", "Float", "0.0000001 to 100.0", "MHT-CET closing cutoff percentile (primary target)"),
        ("current_branch_intake", "Integer", "30 to 360", "Sanctioned branch seat capacity from AICTE/DTE"),
        ("intake_change_absolute", "Integer", "-60 to +120", "Year-over-year change in branch seat capacity")
    ]

    for row_data in schema_rows:
        row = table0.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            set_cell_margins(c, 80, 80, 120, 120)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 1, 2] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)

    add_body("", space_after=6)

    add_h2("3.3 Surgical Data Cleaning & Quarantine Engine")
    add_body(
        "Raw PDF text extraction introduces systematic data anomalies due to multi-line page headers, broken tables, and missing headers. "
        "Rather than applying artificial statistical imputation (such as mean or mode filling, which distorts true admission cutoffs), "
        "a domain-specific recovery algorithm was implemented:"
    )
    add_bullet("Source-Level Category Recovery: Missing category labels caused by PDF page boundary splits were surgically recovered using group-limited ffill() and bfill() within exact [college_code, branch_code, seat_section] boundaries. This recovered 12,940 authentic records.")
    add_bullet("Branch Code Mapping: Standardized 9-digit DTE course codes were cross-mapped against official branch registries to repair parser-truncated branch titles.")
    add_bullet("Quarantine Engine: Records with mathematically invalid ranks (Rank <= 0), corrupt percentiles (< 0 or > 100), or irrecoverable college codes were routed to quarantined CSVs, safeguarding the integrity of master_cap_cutoff_final.csv.")

    add_h2("3.4 Data Validation Criteria (17-Point Audit)")
    add_body(
        "Before feeding records into machine learning models, the dataset was subjected to a comprehensive 17-point validation audit. "
        "Key checks included verifying that CAP round counts were monotonically increasing, academic years spanned the full 2022-2026 range, "
        "exact row duplicates were zero, and percentile distributions complied with state exam boundaries. The final ML dataset contains "
        "exactly 397,152 rows with 0 missing values across all required attributes."
    )

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 4. METHODOLOGY
    # ---------------------------------------------------------------------------
    add_h1("4. Methodology")
    add_h2("4.1 End-to-End Pipeline Workflow")
    add_body(
        "The end-to-end analytical architecture transitions systematically from raw tabular ingestion to interactive frontend decision support. "
        "The complete pipeline is structured into six discrete operational phases:"
    )
    add_bullet("Phase 1: Multi-Year Cutoff Ingestion & Normalization across 2022 to 2026 DTE CAP documents.")
    add_bullet("Phase 2: Surgical Cleansing, Category Boundary Recovery, and Quarantine Filtering.")
    add_bullet("Phase 3: Domain Feature Engineering (Intake expansions, college average baselines, quota encodings).")
    add_bullet("Phase 4: Leakage-Free Temporal Partitioning (Training: Years < 2026; Out-of-Time Testing: 2026-27 CAP1).")
    add_bullet("Phase 5: Supervised Model Benchmarking & Calibrated Blended Ensemble Architecture.")
    add_bullet("Phase 6: Modern React / TypeScript Web Application Deployment with Multi-Tier Decision Support.")

    add_h2("4.2 Tools, Libraries & Development Environment")
    add_body("The project was implemented using state-of-the-art computational and web frameworks:")
    add_bullet("Core Runtime: Python 3.13 (Data engineering, pipeline execution, scikit-learn model training).")
    add_bullet("Data Processing: Pandas 2.2 and NumPy 2.0 (High-performance vector operations and group-by transformations).")
    add_bullet("Machine Learning: Scikit-learn (RandomForestRegressor, ExtraTreesRegressor, ColumnTransformer, OneHotEncoder) and XGBoost.")
    add_bullet("Visualization: Matplotlib 3.9 and Seaborn 0.13 (Statistical distribution plots, error curves, and benchmark visuals).")
    add_bullet("Frontend Platform: React 18, TypeScript, Vite, and TailwindCSS (Interactive dashboard and student wizard).")

    add_h2("4.3 Feature Engineering & Domain Indicators")
    add_body(
        "Cutoff percentiles are governed by both macro-level institutional prestige and micro-level branch capacity dynamics. "
        "The following predictive features were engineered:"
    )
    add_bullet("previous_cutoff: The closing cutoff percentile of the exact college-branch-category option in the preceding round/year. This represents the primary anchor of market demand.")
    add_bullet("college_avg_cutoff: The institutional baseline average cutoff across all branches within a college for that academic year, capturing overall college reputation.")
    add_bullet("current_branch_intake: Sanctioned seat intake for the specialization. Higher intake naturally relaxes competitive cutoff thresholds.")
    add_bullet("intake_change_absolute: Delta between current intake and preceding year intake. A sudden increase of 60 seats dampens cutoffs.")
    add_bullet("is_expanded_branch: Binary flag indicating whether the branch experienced a capacity expansion (>= 30 seats).")
    add_bullet("is_special_quota: Binary indicator for low-density, high-variance reservation categories (PWD, DEF, TFWS).")
    add_bullet("is_female: Binary flag denoting exclusive Ladies (LOPEN, LOBC, LSC, LST) quota seats.")

    add_h2("4.4 Temporal Partitioning & Leakage Prevention")
    add_body(
        "A critical vulnerability in educational admission forecasting is data leakage caused by random train-test splitting. "
        "Random splits allow future admissions within the same academic cycle to leak into the training partition, creating artificial, "
        "overly optimistic metrics that collapse in production. To guarantee true predictive validity, strict temporal partitioning was enforced:"
    )
    add_bullet("Training Partition: Historical records prior to the target year (target_year < 2026), comprising 4,254 matched college-branch-category options.")
    add_bullet("Testing Partition: Unseen prospective target year records (target_year == 2026, CAP Round 1), comprising 27,836 competitive options.")

    add_h2("4.5 Predictive Algorithms & Blended Ensemble Architecture")
    add_body(
        "Three diverse tree-based learners were trained on the encoded feature matrix: Random Forest Regressor (120 estimators, max depth 18), "
        "Extra Trees Regressor (120 estimators, max depth 18), and XGBoost Regressor (120 estimators, learning rate 0.08, max depth 6). "
        "To maximize generalization and cancel individual variance, a Calibrated Blended Ensemble was formulated:"
    )
    add_body("            Y_raw_blend = 0.55 * Y_RandomForest + 0.45 * Y_ExtraTrees")
    add_body("            Y_calibrated = clip( Y_raw_blend + 5.30, 0, 100 )")
    add_body(
        "Here, +5.30 represents the empirical transition shift: closing cutoffs from the final round of the prior year relax substantially "
        "due to seat vacancies, whereas Round 1 of the new cycle experiences peak market demand and higher cutoff thresholds. "
        "Additionally, for low-sample special quotas (PWD/DEF), a shrinkage adjustment blends the model forecast with the category historical median:"
    )
    add_body("            Y_final[is_special] = 0.70 * Y_calibrated + 0.30 * Category_Median")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 5. EXPLORATORY DATA ANALYSIS & VISUALIZATIONS
    # ---------------------------------------------------------------------------
    add_h1("5. Exploratory Data Analysis & Visualizations")
    add_h2("5.1 Historical Cutoff Distributions Across CAP Rounds")
    add_body(
        "Cutoff percentiles across the 397,152 records exhibit a rich multimodal distribution across colleges in Maharashtra. "
        "Figure 1 illustrates the distribution of CAP1 cutoffs alongside boxplots showing the systematic percentile relaxation "
        "as admissions progress from Round 1 to Round 3."
    )

    fig1_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\report_figures\fig_cutoff_distribution_rounds.png"
    add_figure(fig1_path, "Figure 1: Distribution of MHT-CET Cutoff Percentiles and Progression across Consecutive CAP Rounds (n = 397k)")

    add_body(
        "As seen in Figure 1 (right), the median cutoff percentile drops steadily across rounds as high-scoring candidates secure premier "
        "institutes and vacate seats in subsequent rounds. This empirical reality provides strong justification for our round-transition modeling."
    )

    add_h2("5.2 Actual vs Predicted Cutoffs (Initial Baseline)")
    add_body(
        "Figure 2 presents the initial scatter plot between actual 2026-27 CAP1 cutoffs and preliminary predictions. "
        "While the linear relationship is clearly established along the diagonal, significant scatter is evident in lower percentile tiers (< 40) "
        "where admission demand is more diffuse."
    )

    fig2_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\extracted_graphs\graph_01_cell_35_actual_vs_predicted_cutoff.png"
    add_figure(fig2_path, "Figure 2: Scatter Plot of Actual vs. Predicted 2026-27 CAP1 Cutoffs (Baseline Single-Model Execution)")

    add_h2("5.3 Best Model Validation & Reference Scatter")
    add_body(
        "Figure 3 evaluates predictions from the best-performing model against the ideal y = x line (dashed red). "
        "The concentration of predictions tightly hugging the reference diagonal demonstrates strong predictive alignment across premier "
        "and mid-tier institutions (percentiles 60–100)."
    )

    fig3_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\extracted_graphs\graph_02_cell_43_actual_vs_predicted_best_model.png"
    add_figure(fig3_path, "Figure 3: Best Model Performance vs Perfect Prediction Diagonal (y = x)")

    add_h2("5.4 Random Forest Regressor Evaluation")
    add_body(
        "Figure 4 provides a granular evaluation of the Random Forest Regressor across the full 0–100 percentile spectrum. "
        "The model maintains strong bounds across all major engineering clusters."
    )

    fig4_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\extracted_graphs\graph_03_cell_44_random_forest_actual_vs_predicted.png"
    add_figure(fig4_path, "Figure 4: Random Forest Regressor: Actual vs Predicted 2026-27 CAP1 Cutoffs (Percentile Bounds: [-5, 105])")

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 6. MODEL DEVELOPMENT, BENCHMARK RESULTS & ERROR ANALYSIS
    # ---------------------------------------------------------------------------
    add_h1("6. Model Development, Benchmark Results & Error Analysis")
    add_h2("6.1 Comparative Model Performance Benchmarks")
    add_body(
        "All trained models were evaluated on the 27,836 out-of-time test records for the 2026-2027 CAP Round 1. "
        "Table 1 outlines the comparative evaluation across Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), "
        "Coefficient of Determination (R²), Median Absolute Error, Symmetric Mean Absolute Percentage Error (SMAPE), and Training Time."
    )

    # Table 1: Model Benchmarks
    table1 = doc.add_table(rows=1, cols=7)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table1)
    hdr_cells1 = table1.rows[0].cells
    hdr_titles1 = ["Model Architecture", "MAE", "RMSE", "R² Score", "Median AE", "SMAPE (%)", "Train Time (s)"]
    for i, title in enumerate(hdr_titles1):
        hdr_cells1[i].text = title
        set_cell_background(hdr_cells1[i], "1E3A8A")
        set_cell_margins(hdr_cells1[i], 120, 120, 120, 120)
        p = hdr_cells1[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    bench_rows = [
        ("Calibrated Blended Ensemble", "9.9163", "14.5077", "0.6531", "5.8999", "22.15%", "2.48 s"),
        ("Extra Trees Regressor", "10.9185", "15.0993", "0.6243", "7.8390", "24.30%", "1.17 s"),
        ("Random Forest Regressor", "11.4978", "15.6574", "0.5960", "8.5145", "25.49%", "1.30 s"),
        ("XGBoost Regressor", "12.2349", "16.0161", "0.5773", "9.6979", "26.75%", "0.56 s")
    ]

    for row_data in bench_rows:
        row = table1.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            if row_data[0].startswith("Calibrated"):
                set_cell_background(c, "F0FDF4")
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                if row_data[0].startswith("Calibrated"):
                    r.font.bold = True

    add_body("", space_after=6)

    fig_bench_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\report_figures\fig_model_comparison_bars.png"
    add_figure(fig_bench_path, "Figure 5: Benchmark Comparison of Error Metrics (MAE and RMSE) across Evaluated Machine Learning Models")

    add_h2("6.2 Prediction Accuracy Bands (Within ±1, ±2, ±5 Percentiles)")
    add_body(
        "In educational admissions, aggregate error metrics alone do not tell the full story. For students submitting choice forms, "
        "what matters most is whether the prediction falls within a tight threshold of the actual cutoff. Table 2 and Figure 6 compare "
        "the percentage of test predictions achieving high precision bounds."
    )

    # Table 2: Accuracy Bands
    table2 = doc.add_table(rows=1, cols=4)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table2)
    hdr_cells2 = table2.rows[0].cells
    hdr_titles2 = ["Error Tolerance Threshold", "Original Single-Model Baseline", "Calibrated Blended Ensemble", "Relative Improvement"]
    for i, title in enumerate(hdr_titles2):
        hdr_cells2[i].text = title
        set_cell_background(hdr_cells2[i], "1E3A8A")
        set_cell_margins(hdr_cells2[i], 120, 120, 150, 150)
        p = hdr_cells2[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    band_rows = [
        ("Within ±1.0 Percentile Point", "5.82%", "9.23%", "+58.6% Relative Gain"),
        ("Within ±2.0 Percentile Points", "11.89%", "18.79%", "+58.0% Relative Gain"),
        ("Within ±5.0 Percentile Points", "29.31%", "45.13%", "+53.9% Relative Gain"),
        ("Filtered MAPE (Cutoffs >= 10.0)", "34.12%", "22.72%", "33.4% Relative Error Reduction")
    ]

    for row_data in band_rows:
        row = table2.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            set_cell_margins(c, 80, 80, 120, 120)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                if i == 2:
                    r.font.bold = True

    add_body("", space_after=6)

    fig_bands_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\report_figures\fig_accuracy_bands.png"
    add_figure(fig_bands_path, "Figure 6: Accuracy Threshold Improvements: Baseline Single Model vs Calibrated Blended Ensemble")

    add_h2("6.3 Transition Shift Calibration Rationale (+5.30 Percentile)")
    add_body(
        "A key analytical insight revealed during residual analysis was a consistent negative bias in uncalibrated models (mean residual = -5.28). "
        "Because training features originate from the closing rounds of previous years (where cutoffs drop to fill remaining seats), "
        "uncalibrated models systematically underestimate opening CAP Round 1 cutoffs. Introducing the empirical +5.30 shift eliminated "
        "this systemic bias and reduced Median Absolute Error from 8.51 to 5.90."
    )

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 7. FEATURE IMPORTANCE & DOMAIN FACTOR ANALYSIS
    # ---------------------------------------------------------------------------
    add_h1("7. Feature Importance & Domain Factor Analysis")
    add_h2("7.1 Gini / MDI Feature Importance Hierarchy")
    add_body(
        "Feature importance was extracted across tree ensembles using Mean Decrease in Impurity (Gini/MDI). "
        "Figure 7 displays the relative contribution of each engineered predictor in determining closing cutoffs."
    )

    fig_fi_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\report_figures\fig_feature_importance.png"
    add_figure(fig_fi_path, "Figure 7: Relative Feature Importance Hierarchy in Tree Ensembles (Random Forest & Extra Trees)")

    add_h2("7.2 Analytical Interpretation of Admission Factors")
    add_body(
        "Domain factor analysis demonstrates distinct educational dynamics in the Maharashtra engineering admissions ecosystem:"
    )

    # Table 3: Factor Analysis
    table3 = doc.add_table(rows=1, cols=3)
    table3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table3)
    hdr_cells3 = table3.rows[0].cells
    hdr_titles3 = ["Admission Factor", "Relative Importance", "Domain Insight & Impact on Cutoff Boundaries"]
    for i, title in enumerate(hdr_titles3):
        hdr_cells3[i].text = title
        set_cell_background(hdr_cells3[i], "1E3A8A")
        set_cell_margins(hdr_cells3[i], 120, 120, 150, 150)
        p = hdr_cells3[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    factor_rows = [
        ("Previous Round Cutoff (previous_cutoff)", "0.485 (48.5%)", "The dominant anchor. High correlation (r = 0.81) demonstrates strong inertia in college choice preferences across consecutive years."),
        ("College Baseline (college_avg_cutoff)", "0.210 (21.0%)", "Reflects institutional prestige. Autonomous institutes (COEP, VJTI, SPIT, PICT) maintain uniformly elevated cutoffs across all branches."),
        ("Seat Capacity (current_branch_intake)", "0.082 (8.2%)", "Branch size directly dictates competition density. Branches with 180 seats show broader percentile admission bands than 60-seat programs."),
        ("Institution Code (college_code)", "0.071 (7.1%)", "Encodes geographic location (Pune/Mumbai vs rural districts) and accreditation standing."),
        ("Specialization Code (branch_code)", "0.058 (5.8%)", "Reflects technological employment demand. Computer Engineering and IT exhibit sharp premiums over Civil and Chemical branches."),
        ("Reservation Quota (category)", "0.042 (4.2%)", "Captures constitutionally mandated seat reservations (GOPEN, OBC, SC, ST, EWS). Creates structured percentile deltas within the same branch."),
        ("Capacity Expansion (intake_change)", "0.024 (2.4%)", "New division additions create downward pressure on cutoffs, expanding reachability for borderline candidates.")
    ]

    for row_data in factor_rows:
        row = table3.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            set_cell_margins(c, 80, 80, 120, 120)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)

    add_body("", space_after=6)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 8. FULL-STACK WEB APPLICATION & DECISION-SUPPORT SYSTEM
    # ---------------------------------------------------------------------------
    add_h1("8. Full-Stack Web Application & Decision-Support System")
    add_h2("8.1 Software Architecture & Interactive Modules")
    add_body(
        "To translate theoretical machine learning predictions into direct student utility, a full-stack web application "
        "was engineered using React 18, TypeScript, Vite, and TailwindCSS. The platform is organized into five core modules:"
    )
    add_bullet("Executive Dashboard: Visualizes high-level admission metrics (397k records, 350+ institutes, multi-year CAP coverage).")
    add_bullet("Student Profile Wizard: An intuitive step-by-step onboarding flow where candidates input their verified MHT-CET percentile, home university jurisdiction, reservation category, and preferred engineering disciplines.")
    add_bullet("Cutoff Intelligence Engine: Real-time inference engine evaluating predicted cutoffs against the candidate's profile.")
    add_bullet("Historical Trend Explorer: Interactive multi-year comparison charts displaying percentile trajectories across 2022 to 2026.")
    add_bullet("Branch Intake Analyzer: Tracks AICTE seat capacity hikes across colleges to highlight expanding admission opportunities.")

    add_h2("8.2 Interactive Decision-Support & College Reachability Engine")
    add_body(
        "Rather than presenting raw point estimates that may confuse students, the platform classifies each option into three actionable "
        "decision-support reachability bands based on the student's percentile P_cand and the model forecast P_pred:"
    )
    add_bullet("Safe Choices (High Admission Probability): P_cand >= P_pred + 3.0. These colleges represent secure anchors that virtually guarantee seat allotment.")
    add_bullet("Moderate Choices (Target / Competitive): P_pred - 2.5 <= P_cand < P_pred + 3.0. Realistic, competitive choices aligned with the candidate's merit.")
    add_bullet("Dream Choices (Ambitious / Reach): P_cand < P_pred - 2.5. Highly competitive premier institutes that candidates should include in top preference slots.")

    add_h2("8.3 Sample Prediction Walkthrough")
    add_body(
        "Table 4 illustrates a realistic scenario for a student with an 88.50 MHT-CET Percentile in the OBC Category seeking Computer Engineering in Pune:"
    )

    # Table 4: Sample Prediction
    table4 = doc.add_table(rows=1, cols=5)
    table4.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table4)
    hdr_cells4 = table4.rows[0].cells
    hdr_titles4 = ["Institution Name", "Discipline", "Predicted Cutoff", "Reachability Tier", "Strategic Recommendation"]
    for i, title in enumerate(hdr_titles4):
        hdr_cells4[i].text = title
        set_cell_background(hdr_cells4[i], "1E3A8A")
        set_cell_margins(hdr_cells4[i], 120, 120, 120, 120)
        p = hdr_cells4[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    sample_rows = [
        ("COEP Tech University, Pune", "Computer Engineering", "99.40 %ile", "Dream", "Place in Option 1-5; aspirational high-prestige choice."),
        ("PICT, Pune", "Information Technology", "97.80 %ile", "Dream", "Top-tier choice; competitive reach."),
        ("VIIT, Kondhwa, Pune", "Computer Engineering", "89.20 %ile", "Moderate", "High-priority target; within 1% of candidate's score."),
        ("PCCOE, Ravet, Pune", "Artificial Intelligence & DS", "87.40 %ile", "Safe", "Strong candidate; safe admission probability."),
        ("DY Patil COE, Akurdi", "Computer Engineering", "84.10 %ile", "Safe", "Reliable backup choice; guaranteed allotment tier.")
    ]

    for row_data in sample_rows:
        row = table4.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            if row_data[3] == "Safe":
                set_cell_background(c, "F0FDF4")
            elif row_data[3] == "Moderate":
                set_cell_background(c, "FEFCE8")
            elif row_data[3] == "Dream":
                set_cell_background(c, "FEF2F2")
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(9.5)
                if i == 3:
                    r.font.bold = True

    add_body("", space_after=6)

    doc.add_page_break()

    # ---------------------------------------------------------------------------
    # 9. LIMITATIONS
    # ---------------------------------------------------------------------------
    add_h1("9. Limitations")
    add_body(
        "While the system achieves state-of-the-art predictive performance on out-of-time test allocations, several domain "
        "and methodological boundaries must be recognized:"
    )

    # Table 5: Limitations
    table5 = doc.add_table(rows=1, cols=3)
    table5.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table5)
    hdr_cells5 = table5.rows[0].cells
    hdr_titles5 = ["Limitation Dimension", "Underlying Cause", "Operational Impact & Mitigation Strategy"]
    for i, title in enumerate(hdr_titles5):
        hdr_cells5[i].text = title
        set_cell_background(hdr_cells5[i], "1E3A8A")
        set_cell_margins(hdr_cells5[i], 120, 120, 150, 150)
        p = hdr_cells5[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    lim_rows = [
        ("Newly Established Institutes", "Absence of historical cutoff trajectories (zero previous_cutoff).", "System defaults to geographic district averages; clearly flagged in UI."),
        ("Special Quota Sparsity", "Very small seat counts for PWD/DEF categories (often 1-2 seats per branch).", "Addressed via micro-quota shrinkage regularization toward category medians."),
        ("Policy & Seat Matrix Shocks", "Unpredictable government reservation revisions or sudden autonomous seat quota shifts.", "Requires annual re-calibration as soon as provisional seat matrices are released."),
        ("Student Preference Volatility", "Sudden employment market shifts affecting branch preferences (e.g., AI/DS surge).", "Ensemble feature weights partially adapt via year-over-year intake delta signals.")
    ]

    for row_data in lim_rows:
        row = table5.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            c.text = val
            set_cell_margins(c, 80, 80, 120, 120)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)

    add_body("", space_after=6)

    # ---------------------------------------------------------------------------
    # 10. CONCLUSION & FUTURE DIRECTIONS
    # ---------------------------------------------------------------------------
    add_h1("10. Conclusion & Future Directions")
    add_body(
        "This project successfully developed and evaluated an end-to-end Machine Learning College Cutoff Intelligence Platform "
        "tailored to the Maharashtra engineering admissions ecosystem. By engineering a surgical data pipeline, over 397,000 authentic records "
        "across five academic cycles were standardized with zero artificial imputation. Strict temporal partitioning guaranteed authentic, "
        "leakage-free validation on 27,836 competitive options in the 2026-2027 CAP Round 1."
    )
    add_body(
        "The proposed Calibrated Blended Ensemble—combining Random Forest (55%) and Extra Trees (45%) with an empirical +5.30 transition "
        "shift and micro-quota shrinkage—demonstrated marked superiority over standard baselines, achieving an MAE of 9.916, RMSE of 14.508, "
        "and an R² of 0.6531. Most critically for student utility, predictions within the tight ±5 percentile threshold increased by over 53% "
        "(from 29.31% to 45.13%)."
    )
    add_body(
        "The trained pipeline was embedded into a responsive, full-stack React and TypeScript application featuring an automated "
        "Three-Tier Reachability Engine (Safe, Moderate, Dream). Future extensions will incorporate Natural Language Processing (NLP) "
        "on student preference forums, deep learning time-series architectures (e.g., Temporal Fusion Transformers), and progressive web app (PWA) "
        "capabilities to serve mobile users during the active CAP admission season."
    )

    # ---------------------------------------------------------------------------
    # 11. REFERENCES
    # ---------------------------------------------------------------------------
    add_h1("11. References")
    references = [
        "State Common Entrance Test Cell, Government of Maharashtra, “Information Brochure for Centralized Admission Process (CAP) to First Year Undergraduate Technical Courses,” DTE Maharashtra Official Publications, 2022–2026.",
        "L. Breiman, “Random Forests,” Machine Learning, vol. 45, no. 1, pp. 5–32, 2001.",
        "P. Geurts, D. Ernst, and L. Wehenkel, “Extremely randomized trees,” Machine Learning, vol. 63, no. 1, pp. 3–42, 2006.",
        "T. Chen and C. Guestrin, “XGBoost: A Scalable Tree Boosting System,” in Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD), pp. 785–794, 2016.",
        "C. Romero and S. Ventura, “Educational Data Mining: A Review of the State of the Art,” IEEE Transactions on Systems, Man, and Cybernetics, Part C (Applications and Reviews), vol. 40, no. 6, pp. 601–618, 2010.",
        "F. Pedregosa et al., “Scikit-learn: Machine Learning in Python,” Journal of Machine Learning Research (JMLR), vol. 12, pp. 2825–2830, 2011.",
        "M. S. Al-Razgan and A. S. Al-Khalifa, “Educational Data Mining: A Systematic Mapping of the Literature,” IEEE Access, vol. 8, pp. 101740–101755, 2020.",
        "Y. Baashar, G. Alkawsi, N. Ali, H. Alhussian, and H. T. Bahbouh, “Predicting student’s performance using machine learning methods: a systematic literature review,” in Proceedings of the 2021 International Conference on Computer and Information Sciences (ICCOINS), pp. 357–362, June 2021."
    ]

    for ref in references:
        add_bullet(ref)

    # Save
    out_file = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\MHT_CET_College_Cutoff_Project_Report.docx"
    doc.save(out_file)
    print(f"Report successfully generated and saved to: {out_file}")

if __name__ == "__main__":
    create_report()
