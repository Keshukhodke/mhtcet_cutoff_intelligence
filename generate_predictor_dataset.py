import csv
import json
import re
import os
import sys

districts_known = [
    'Amravati', 'Akola', 'Yavatmal', 'Buldhana', 'Washim',
    'Chhatrapati Sambhajinagar', 'Aurangabad', 'Jalna', 'Beed', 'Osmanabad', 'Dharashiv', 'Nanded', 'Parbhani', 'Latur', 'Hingoli',
    'Mumbai Suburban', 'Mumbai City', 'Mumbai', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg',
    'Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli',
    'Nashik', 'Jalgaon', 'Dhule', 'Nandurbar', 'Ahmednagar', 'Ahilyanagar',
    'Pune', 'Satara', 'Sangli', 'Kolhapur', 'Solapur'
]

def extract_meta(name, code):
    name_str = str(name)
    found_dist = None
    for d in districts_known:
        if re.search(r'\b' + re.escape(d) + r'\b', name_str, re.IGNORECASE):
            found_dist = d
            break
    
    code_int = int(code)
    region_code = code_int // 1000
    
    if found_dist in ['Aurangabad', 'Chhatrapati Sambhajinagar']:
        found_dist = 'Chhatrapati Sambhajinagar'
    elif found_dist in ['Ahmednagar', 'Ahilyanagar']:
        found_dist = 'Ahilyanagar'
    elif found_dist in ['Osmanabad', 'Dharashiv']:
        found_dist = 'Dharashiv'
    elif found_dist == 'Mumbai':
        found_dist = 'Mumbai Suburban' if any(w in name_str.lower() for w in ['bandra', 'andheri', 'vile parle', 'kandivali', 'borivali', 'chembur', 'malad', 'kurla', 'ghatkopar', 'versova']) else 'Mumbai City'
    
    if not found_dist:
        if region_code == 1: found_dist = 'Amravati'
        elif region_code == 2: found_dist = 'Chhatrapati Sambhajinagar'
        elif region_code == 3: found_dist = 'Mumbai Suburban'
        elif region_code == 4: found_dist = 'Nagpur'
        elif region_code == 5: found_dist = 'Nashik'
        elif region_code == 6: found_dist = 'Pune'
        else: found_dist = 'Maharashtra'
        
    if found_dist in ['Pune', 'Nashik', 'Ahilyanagar']:
        uni = 'Savitribai Phule Pune University'
    elif found_dist in ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg']:
        uni = 'Mumbai University'
    elif found_dist in ['Nagpur', 'Wardha', 'Bhandara', 'Gondia']:
        uni = 'Rashtrasant Tukadoji Maharaj Nagpur University'
    elif found_dist in ['Chandrapur', 'Gadchiroli']:
        uni = 'Gondwana University'
    elif found_dist in ['Amravati', 'Akola', 'Yavatmal', 'Buldhana', 'Washim']:
        uni = 'Sant Gadge Baba Amravati University'
    elif found_dist in ['Chhatrapati Sambhajinagar', 'Jalna', 'Beed', 'Dharashiv']:
        uni = 'Dr. Babasaheb Ambedkar Marathwada University'
    elif found_dist in ['Nanded', 'Latur', 'Parbhani', 'Hingoli']:
        uni = 'Swami Ramanand Teerth Marathwada University'
    elif found_dist in ['Kolhapur', 'Sangli', 'Satara']:
        uni = 'Shivaji University'
    elif found_dist in ['Solapur']:
        uni = 'Punyashlok Ahilyadevi Holkar Solapur University'
    elif found_dist in ['Jalgaon', 'Dhule', 'Nandurbar']:
        uni = 'Kavayitri Bahinabai Chaudhari North Maharashtra University'
    else:
        uni = 'Dr. Babasaheb Ambedkar Technological University'
        
    is_auto = bool(re.search(r'autonomous', name_str, re.IGNORECASE))
    return found_dist, uni, is_auto

def main():
    csv_path = r'd:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\data\final\master_cap_cutoff_final.csv'
    out_json = r'd:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\frontend\src\data\predictorData.json'
    
    print('Reading master CSV...')
    colleges = {}
    branches = set()
    categories = set()
    
    # Store aggregated rows for latest year 2026-2027 (and we can also include 2025-2026)
    # Key: (college_code, branch_name, category) -> {'r1': p, 'r2': p, 'r3': p, 'r4': p, 'rk1': r, 'rk2': r, 'rk3': r, 'rk4': r}
    data_2026 = {}
    data_2025 = {}
    
    with open(csv_path, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            count += 1
            yr = row.get('academic_year')
            if yr not in ('2026-2027', '2025-2026'):
                continue
                
            c_code = int(row['college_code'])
            c_name = row['college_name'].strip()
            b_name = row['branch_name'].strip()
            cat = row['category'].strip()
            round_str = row['cap_round'].strip() # CAP1, CAP2, CAP3, CAP4
            
            try:
                pct = float(row['percentile'])
            except (ValueError, TypeError):
                pct = None
                
            try:
                rk = int(float(row['merit_rank']))
            except (ValueError, TypeError):
                rk = None
                
            if c_code not in colleges:
                dist, uni, auto = extract_meta(c_name, c_code)
                colleges[c_code] = {
                    'code': c_code,
                    'name': c_name,
                    'dist': dist,
                    'uni': uni,
                    'auto': auto
                }
                
            branches.add(b_name)
            categories.add(cat)
            
            store = data_2026 if yr == '2026-2027' else data_2025
            key = (c_code, b_name, cat)
            if key not in store:
                store[key] = {}
            if round_str not in store[key]:
                store[key][round_str] = (pct, rk)
                
    print(f'Processed {count} records.')
    print(f'Unique colleges: {len(colleges)}')
    print(f'2026 distinct (college, branch, quota): {len(data_2026)}')
    print(f'2025 distinct (college, branch, quota): {len(data_2025)}')
    
    # Format rows
    # Target: list of items:
    # {
    #   c: college_code,
    #   b: branch_name,
    #   q: category/quota,
    #   p: [r1_pct, r2_pct, r3_pct, r4_pct, avg_pct],
    #   r: [r1_rk, r2_rk, r3_rk, r4_rk, avg_rk]
    # }
    def build_rows(store):
        result = []
        for (c_code, b_name, cat), r_dict in store.items():
            r1_p, r1_r = r_dict.get('CAP1', (None, None))
            r2_p, r2_r = r_dict.get('CAP2', (None, None))
            r3_p, r3_r = r_dict.get('CAP3', (None, None))
            r4_p, r4_r = r_dict.get('CAP4', (None, None))
            
            p_list = [p for p in (r1_p, r2_p, r3_p, r4_p) if p is not None]
            avg_p = round(sum(p_list) / len(p_list), 4) if p_list else 0.0
            
            r_list = [rk for rk in (r1_r, r2_r, r3_r, r4_r) if rk is not None]
            avg_r = int(sum(r_list) / len(r_list)) if r_list else 0
            
            result.append({
                'c': c_code,
                'b': b_name,
                'q': cat,
                'p': [
                    round(r1_p, 4) if r1_p is not None else None,
                    round(r2_p, 4) if r2_p is not None else None,
                    round(r3_p, 4) if r3_p is not None else None,
                    round(r4_p, 4) if r4_p is not None else None,
                    avg_p
                ],
                'r': [r1_r, r2_r, r3_r, r4_r, avg_r]
            })
        return result

    rows_2026 = build_rows(data_2026)
    rows_2025 = build_rows(data_2025)
    
    output_obj = {
        'colleges': colleges,
        'branches': sorted(list(branches)),
        'categories': sorted(list(categories)),
        'rows_2026': rows_2026,
        'rows_2025': rows_2025
    }
    
    print('Writing output JSON...')
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(output_obj, f, separators=(',', ':'))
        
    size_mb = os.path.getsize(out_json) / 1024 / 1024
    print(f'Successfully generated {out_json} ({size_mb:.2f} MB)!')

if __name__ == '__main__':
    main()
