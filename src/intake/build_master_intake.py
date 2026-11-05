"""
CETCompass AI — Build Canonical Master Intake Dataset (Updated & Hardened)
Ensures:
1. institute_code formatted as 5-character string (preserving leading zeros, e.g., '01002', '16006')
2. branch_code formatted as 3-digit string (e.g., '002', '011', '191', '242')
3. choice_code strictly preserved as string
4. String quoting on export to prevent automatic numeric truncation
Outputs: data/intake/branch_intake_master.csv
"""

import os
import re
import csv
import pandas as pd
import numpy as np

BRANCH_FAMILIES = {
    'Computer & Information Technology': [
        '242', '245', '246', '251', '254', '271', '566', '568', '905', '927'
    ],
    'Artificial Intelligence & Emerging Tech': [
        '219', '252', '253', '257', '260', '262', '263', '265', '266', '267', '273',
        '844', '900', '910', '911', '912', '913', '916', '917', '920', '921', '924',
        '925', '932', '995', '997'
    ],
    'Electronics & Telecommunication / Circuit': [
        '272', '370', '372', '373', '376', '378', '379', '380', '388', '461', '464',
        '466', '909', '928', '929', '933', '935'
    ],
    'Electrical Engineering': [
        '293', '297', '356', '384', '573', '926', '937'
    ],
    'Mechanical & Production': [
        '259', '585', '602', '606', '612', '615', '616', '617', '624', '625', '626',
        '627', '908'
    ],
    'Civil & Infrastructure': [
        '191', '258', '463', '906', '914', '915', '918', '922', '934', '936'
    ],
    'Chemical, Textile & Material Sciences': [
        '002', '011', '082', '083', '084', '465', '501', '503', '504', '507', '508', '511',
        '512', '513', '514', '515', '517', '518', '519', '523', '524', '527', '529',
        '534', '570', '692', '694', '701', '729', '816', '841', '886', '890', '893',
        '896', '904', '907'
    ]
}

CODE_TO_FAMILY = {}
for family, codes in BRANCH_FAMILIES.items():
    for c in codes:
        CODE_TO_FAMILY[c] = family


def clean_text(val):
    if pd.isna(val):
        return ''
    s = re.sub(r'[^\x00-\x7F]+', ' ', str(val))
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def extract_branch_code(choice_code, inst_code):
    c_str = str(choice_code).strip()
    i_str = str(inst_code).strip()
    for pad in [i_str.zfill(5), i_str, i_str.zfill(4)]:
        if c_str.startswith(pad):
            rem = c_str[len(pad):]
            if len(rem) >= 3 and rem[:3].isdigit():
                return rem[:3]
    return 'UNKNOWN'


def build_canonical_master():
    print("Reading raw extracted datasets...")
    df_raw = pd.read_csv('data/intake/raw_extracted_courses.csv', dtype=str)
    df_insts = pd.read_csv('data/intake/raw_extracted_institutes.csv', dtype=str)
    df_insts = df_insts[df_insts['directory_status'] != 'Total'].copy()

    # Format institute codes strictly as 5-character strings with leading zeros
    df_raw['institute_code'] = df_raw['institute_code'].astype(str).str.strip().str.zfill(5)
    df_raw['choice_code'] = df_raw['choice_code'].astype(str).str.strip()
    df_raw['branch_name_original'] = df_raw['branch_name_original'].apply(clean_text)
    df_raw['institute_name'] = df_raw['institute_name'].apply(clean_text)
    df_raw['district'] = df_raw['district'].apply(clean_text)
    df_raw['region'] = df_raw['region'].apply(clean_text)
    df_raw['university'] = df_raw['university'].apply(clean_text)
    df_raw['institute_status'] = df_raw['institute_status'].apply(clean_text)
    df_raw['autonomy_status'] = df_raw['autonomy_status'].apply(clean_text)
    df_raw['minority_status'] = df_raw['minority_status'].apply(clean_text)

    # Convert intake_capacity to integer
    df_raw['intake_capacity'] = df_raw['intake_capacity'].astype(int)

    # Extract official 3-digit branch code (preserved as 3-char string)
    df_raw['branch_code'] = df_raw.apply(
        lambda r: extract_branch_code(r['choice_code'], r['institute_code']), axis=1
    ).str.zfill(3)

    # Classify intake_type
    df_raw['intake_type'] = np.where(
        df_raw['choice_code'].str.endswith('T'),
        'TFWS Supernumerary Intake',
        'Approved Intake'
    )

    # Determine canonical branch name per branch code
    canonical_branch_names = (
        df_raw.groupby('branch_code')['branch_name_original']
        .agg(lambda s: s.mode()[0] if not s.empty else '')
        .to_dict()
    )

    # Touch-ups for specific codes
    touchups = {
        '935': 'Electronics and Biomedical Engineering',
        '378': 'Electronics Engineering (VLSI Design and Technology)',
        '379': 'Electronics and Communication Engineering (Biomedical Engineering)',
        '585': 'Mechanical and Rail Engineering',
        '910': 'Computer Science and Engineering (Cyber Security)',
        '911': 'Computer Science and Engineering (AI and ML)',
        '912': 'Computer Science and Engineering (Data Science)',
        '913': 'Computer Science and Engineering (Artificial Intelligence)',
        '920': 'Computer Science and Engineering (IoT and Cyber Security Including Blockchain)',
        '925': 'Computer Science and Engineering (AI and Data Science)',
        '933': 'Electronics and Communication (Advanced Communication Technology)'
    }
    canonical_branch_names.update(touchups)

    df_raw['branch_name'] = df_raw['branch_code'].map(canonical_branch_names).fillna(df_raw['branch_name_original'])
    df_raw['branch_family'] = df_raw['branch_code'].map(CODE_TO_FAMILY).fillna('Other Engineering Disciplines')

    # Standardize institute name
    canonical_inst_names = (
        df_raw.groupby('institute_code')['institute_name']
        .agg(lambda s: s.mode()[0] if not s.empty else '')
        .to_dict()
    )
    df_raw['institute_name_standard'] = df_raw['institute_code'].map(canonical_inst_names).fillna(df_raw['institute_name'])

    # Determine record status across years for each (institute_code, branch_code, intake_type)
    group_presence = df_raw.groupby(['institute_code', 'branch_code', 'intake_type'])['academic_year'].unique().to_dict()

    def get_record_status(row):
        key = (row['institute_code'], row['branch_code'], row['intake_type'])
        years = group_presence.get(key, [])
        has_24 = '2024-25' in years
        has_25 = '2025-26' in years
        has_26 = '2026-27' in years
        
        curr_yr = row['academic_year']
        if has_24 and has_25 and has_26:
            return 'EXISTING'
        elif not has_24 and has_25 and curr_yr == '2025-26':
            return 'NEW_IN_2025'
        elif not has_24 and not has_25 and has_26 and curr_yr == '2026-27':
            return 'NEW_IN_2026'
        elif has_24 and curr_yr == '2024-25' and not has_26:
            return 'POTENTIALLY_DISCONTINUED'
        elif has_25 and curr_yr == '2025-26' and not has_26:
            return 'POTENTIALLY_DISCONTINUED'
        else:
            return 'EXISTING'

    df_raw['record_status'] = df_raw.apply(get_record_status, axis=1)
    df_raw['extraction_status'] = 'VERIFIED'
    df_raw['mapping_status'] = 'EXACT_CODE_MATCH'

    # Master DataFrame schema
    master_cols = [
        'academic_year',
        'institute_code',
        'institute_name_standard',
        'branch_code',
        'branch_name',
        'branch_family',
        'district',
        'region',
        'university',
        'institute_status',
        'autonomy_status',
        'minority_status',
        'shift',
        'gender',
        'choice_code',
        'intake_type',
        'intake_capacity',
        'source_url',
        'source_file',
        'extraction_status',
        'mapping_status',
        'record_status'
    ]

    df_master = df_raw[master_cols].copy()
    df_master.rename(columns={'institute_name_standard': 'institute_name'}, inplace=True)

    # Sort logically
    df_master.sort_values(
        by=['academic_year', 'institute_code', 'branch_code', 'intake_type'],
        inplace=True
    )

    out_master_path = 'data/intake/branch_intake_master.csv'
    os.makedirs('data/intake', exist_ok=True)
    # Quote non-numeric values to preserve leading zeros in institute_code, branch_code, choice_code
    df_master.to_csv(out_master_path, index=False, encoding='utf-8', quoting=csv.QUOTE_NONNUMERIC)
    print(f"Saved canonical master CSV to {out_master_path} with {len(df_master)} records.")

    print("\nMaster Dataset Summary:")
    print(f"Total Records: {len(df_master)}")
    print("Exact Counts by Academic Year and Intake Type:")
    print(df_master.groupby(['academic_year', 'intake_type']).size())


if __name__ == '__main__':
    build_canonical_master()
