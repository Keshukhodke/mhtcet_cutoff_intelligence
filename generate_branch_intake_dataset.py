import pandas as pd
import json
import re
import os

print("Generating branch intake dataset (Clean Total Intake without category breakdown)...")

df = pd.read_csv('data/intake/branch_intake_master.csv')
# Prioritize latest academic years
df['year_sort'] = df['academic_year'].map({'2026-27': 3, '2025-26': 2, '2024-25': 1}).fillna(0)
df = df.sort_values(by=['year_sort'], ascending=False)

def get_family(b_name, raw_fam):
    s = (str(b_name) + ' ' + str(raw_fam)).lower()
    if any(k in s for k in ['computer', 'software', 'information tech', 'it', 'artificial intelligence', 'machine learning', 'data science', 'cyber', 'iot']):
        return 'Computer & IT'
    if any(k in s for k in ['electronics', 'telecomm', 'extc', 'ece', 'vlsi', 'entc']):
        return 'Electronics & Telecom'
    if any(k in s for k in ['mechanical', 'mechatronics', 'automobile', 'production', 'manufacturing', 'robotics']):
        return 'Mechanical & Production'
    if any(k in s for k in ['electrical', 'power']):
        return 'Electrical Engineering'
    if any(k in s for k in ['civil', 'structural', 'construction', 'environmental']):
        return 'Civil & Infrastructure'
    if any(k in s for k in ['chemical', 'petro', 'polymer', 'plastic', 'oil']):
        return 'Chemical & Petro'
    if any(k in s for k in ['metallurgy', 'material']):
        return 'Metallurgy & Materials'
    if any(k in s for k in ['bio', 'biomedical', 'pharm']):
        return 'Biomedical & Allied'
    return 'Core Engineering'

inst_dict = {}

def normalize_sanctioned_intake(cap_val):
    if cap_val <= 0:
        return 60
    if cap_val % 30 == 0:
        return cap_val
    for unit in [30, 60, 90, 120, 150, 180, 240, 300]:
        if cap_val in [int(unit * 0.9), round(unit * 0.9), int(unit * 0.85), round(unit * 0.85), int(unit * 0.8), round(unit * 0.8)]:
            return unit
    return cap_val

for _, r in df.iterrows():
    name = str(r['institute_name']).strip()
    raw_code = str(r['institute_code']).strip()
    norm_name = re.sub(r'[^a-z0-9]', '', name.lower())
    try:
        code_int = int(raw_code)
        short_code = str(code_int % 10000) if code_int >= 10000 else str(code_int)
    except:
        short_code = raw_code

    primary_key = norm_name
    if primary_key not in inst_dict:
        inst_dict[primary_key] = {
            'institute_name': name,
            'institute_code': short_code,
            'raw_code': raw_code,
            'district': str(r.get('district', '')),
            'region': str(r.get('region', '')),
            'university': str(r.get('university', '')),
            'autonomy_status': str(r.get('autonomy_status', 'Non-Autonomous')),
            'branches': {}
        }

    b_map = inst_dict[primary_key]['branches']
    b_name = str(r['branch_name']).strip()
    choice = str(r.get('choice_code', '')).strip()
    is_tfws = choice.endswith('T') or 'tfws' in str(r.get('intake_type', '')).lower()
    
    # We only take regular CAP sanctioned intake as the official Total Branch Intake!
    if is_tfws:
        continue

    cap = int(r['intake_capacity']) if pd.notnull(r['intake_capacity']) else 0
    if cap == 0:
        continue
    cap = normalize_sanctioned_intake(cap)

    if b_name not in b_map:
        b_map[b_name] = {
            'branch_name': b_name,
            'branch_family': get_family(b_name, r.get('branch_family', '')),
            'total_intake': cap,
            'choice_code': choice,
            'shift': str(r.get('shift', 'General Shift'))
        }
    elif b_map[b_name]['total_intake'] == 0:
        b_map[b_name]['total_intake'] = cap
        b_map[b_name]['choice_code'] = choice

by_norm_name = {}
by_code = {}
all_institutes = []

for k, inst in inst_dict.items():
    branch_list = []
    tot_inst = 0

    for b_name, b_data in inst['branches'].items():
        cap = b_data['total_intake']
        if cap == 0:
            cap = 60  # Standard AICTE baseline
        tot_inst += cap

        branch_list.append({
            'branch_name': b_name,
            'branch_family': b_data['branch_family'],
            'total_intake': cap,
            'choice_code': b_data['choice_code'],
            'shift': b_data['shift']
        })

    # Sort branches by intake descending
    branch_list.sort(key=lambda x: x['total_intake'], reverse=True)

    for b in branch_list:
        b['share_pct'] = round((b['total_intake'] / tot_inst * 100), 1) if tot_inst > 0 else 0

    inst_record = {
        'institute_name': inst['institute_name'],
        'institute_code': inst['institute_code'],
        'raw_code': inst['raw_code'],
        'district': inst['district'],
        'region': inst['region'],
        'university': inst['university'],
        'autonomy_status': inst['autonomy_status'],
        'total_intake': tot_inst,
        'total_branches': len(branch_list),
        'branches': branch_list
    }

    by_norm_name[k] = inst_record
    by_code[inst['institute_code']] = inst_record
    by_code[inst['raw_code']] = inst_record
    all_institutes.append(inst_record)

output_data = {
    'byNormalizedName': by_norm_name,
    'byCode': by_code,
    'totalInstitutes': len(all_institutes)
}

out_path = 'frontend/public/data/branchIntakeData.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False)

size_mb = os.path.getsize(out_path) / (1024 * 1024)
print(f"Generated {out_path} ({size_mb:.2f} MB) with clean Total Branch Intake!")
