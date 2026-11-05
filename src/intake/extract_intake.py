"""
CETCompass AI — Intake Data Extraction Pipeline
Official Sources:
- 2026-27: https://fe2026.mahacet.org/StaticPages/frmInstituteList?did=1884
- 2025-26: https://fe2025.mahacet.org/StaticPages/frmInstituteList?did=1884
- 2024-25: https://fe2024.mahacet.org/StaticPages/frmInstituteList?did=1884
"""

import os
import sys
import time
import requests
from bs4 import BeautifulSoup
import urllib3
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings()

YEARS_CONFIG = {
    '2024-25': {
        'year_code': '2024',
        'directory_url': 'https://fe2024.mahacet.org/StaticPages/frmInstituteList?did=1884',
        'base_detail_url': 'https://fe2024.mahacet.org/StaticPages/'
    },
    '2025-26': {
        'year_code': '2025',
        'directory_url': 'https://fe2025.mahacet.org/StaticPages/frmInstituteList?did=1884',
        'base_detail_url': 'https://fe2025.mahacet.org/StaticPages/'
    },
    '2026-27': {
        'year_code': '2026',
        'directory_url': 'https://fe2026.mahacet.org/StaticPages/frmInstituteList?did=1884',
        'base_detail_url': 'https://fe2026.mahacet.org/StaticPages/'
    }
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}


def download_or_load(url, local_path, session=None):
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        with open(local_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read(), True
    
    s = session or requests.Session()
    s.headers.update(HEADERS)
    resp = s.get(url, verify=False, timeout=25)
    if resp.status_code == 200:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, 'w', encoding='utf-8', errors='ignore') as f:
            f.write(resp.text)
        return resp.text, False
    else:
        raise Exception(f"HTTP {resp.status_code} for {url}")


def extract_directory(academic_year, config):
    yr = config['year_code']
    url = config['directory_url']
    raw_file = f"data/intake/raw/institute_list_{yr}.html"
    
    html, cached = download_or_load(url, raw_file)
    soup = BeautifulSoup(html, 'html.parser')
    tables = soup.find_all('table')
    if len(tables) < 2:
        raise Exception(f"Directory table not found for {academic_year}")
    
    tbl = tables[1]
    rows = tbl.find_all('tr')
    institutes = []
    
    for row in rows[1:]:
        cols = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
        if len(cols) >= 5:
            inst_code = cols[1]
            inst_name = cols[2]
            status = cols[3]
            tot_intake = cols[4]
            
            link = row.find('a')
            href = link.get('href') if link else f"frmInstituteSummary.aspx?InstituteCode={inst_code}"
            if not href.startswith('http'):
                detail_url = config['base_detail_url'] + href
            else:
                detail_url = href
                
            institutes.append({
                'academic_year': academic_year,
                'year_code': yr,
                'institute_code': inst_code,
                'institute_name': inst_name,
                'directory_status': status,
                'directory_total_intake': int(tot_intake) if tot_intake.isdigit() else None,
                'detail_url': detail_url,
                'detail_file': f"data/intake/raw/{yr}/inst_{inst_code}.html"
            })
            
    print(f"[{academic_year}] Parsed {len(institutes)} institutes from directory.")
    return institutes


def parse_institute_summary(inst_meta, session):
    ay = inst_meta['academic_year']
    yr = inst_meta['year_code']
    code = inst_meta['institute_code']
    detail_url = inst_meta['detail_url']
    local_file = inst_meta['detail_file']
    
    records = []
    inst_info = {
        'academic_year': ay,
        'institute_code': code,
        'institute_name': inst_meta['institute_name'],
        'directory_status': inst_meta['directory_status'],
        'directory_total_intake': inst_meta['directory_total_intake'],
        'address': '',
        'region': '',
        'district': '',
        'inst_status': '',
        'autonomy_status': '',
        'minority_status': '',
        'university': '',
        'detail_url': detail_url,
        'detail_file': local_file,
        'has_course_table': False,
        'course_count': 0
    }
    
    try:
        html, cached = download_or_load(detail_url, local_file, session)
        soup = BeautifulSoup(html, 'html.parser')
        tables = soup.find_all('table')
        
        # Parse Table 0: Metadata
        if len(tables) > 0:
            for row in tables[0].find_all('tr'):
                cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
                for i in range(0, len(cells) - 1, 2):
                    k = cells[i].lower()
                    v = cells[i+1]
                    if 'address' in k:
                        inst_info['address'] = v
                    elif 'region' in k:
                        inst_info['region'] = v
                    elif 'district' in k:
                        inst_info['district'] = v
                    elif 'autonomy' in k:
                        inst_info['autonomy_status'] = v
                    elif 'minority' in k:
                        inst_info['minority_status'] = v
                    elif k == 'status':
                        inst_info['inst_status'] = v
                    elif 'institute name' in k and not inst_info['institute_name']:
                        inst_info['institute_name'] = v
        
        # Parse Table 1: Courses
        if len(tables) > 1:
            course_table = tables[1]
            rows = course_table.find_all('tr')
            if len(rows) > 1:
                inst_info['has_course_table'] = True
                headers_t = [th.get_text(strip=True).lower() for th in rows[0].find_all(['th', 'td'])]
                
                # Identify column positions
                col_map = {}
                for idx, h in enumerate(headers_t):
                    if 'choice' in h:
                        col_map['choice_code'] = idx
                    elif 'course' in h or 'branch' in h:
                        col_map['course_name'] = idx
                    elif 'university' in h:
                        col_map['university'] = idx
                    elif 'autonomy' in h:
                        col_map['autonomy_status'] = idx
                    elif 'minority' in h:
                        col_map['minority_status'] = idx
                    elif 'shift' in h:
                        col_map['shift'] = idx
                    elif 'accreditation' in h:
                        col_map['accreditation'] = idx
                    elif 'gender' in h:
                        col_map['gender'] = idx
                    elif 'intake' in h:
                        col_map['intake'] = idx
                    elif h == 'status':
                        col_map['course_status'] = idx
                        
                for row in rows[1:]:
                    cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
                    if len(cells) < 2:
                        continue
                        
                    choice_code = cells[col_map.get('choice_code', 0)] if 'choice_code' in col_map and col_map['choice_code'] < len(cells) else cells[0]
                    course_name = cells[col_map.get('course_name', 1)] if 'course_name' in col_map and col_map['course_name'] < len(cells) else (cells[1] if len(cells) > 1 else '')
                    univ = cells[col_map['university']] if 'university' in col_map and col_map['university'] < len(cells) else ''
                    c_status = cells[col_map['course_status']] if 'course_status' in col_map and col_map['course_status'] < len(cells) else ''
                    c_autonomy = cells[col_map['autonomy_status']] if 'autonomy_status' in col_map and col_map['autonomy_status'] < len(cells) else inst_info['autonomy_status']
                    c_minority = cells[col_map['minority_status']] if 'minority_status' in col_map and col_map['minority_status'] < len(cells) else inst_info['minority_status']
                    shift = cells[col_map['shift']] if 'shift' in col_map and col_map['shift'] < len(cells) else ''
                    gender = cells[col_map['gender']] if 'gender' in col_map and col_map['gender'] < len(cells) else ''
                    
                    intake_idx = col_map.get('intake', len(cells)-1)
                    raw_intake = cells[intake_idx] if intake_idx < len(cells) else '0'
                    intake_num = int(raw_intake) if raw_intake.isdigit() else 0
                    
                    if univ and not inst_info['university']:
                        inst_info['university'] = univ
                        
                    records.append({
                        'academic_year': ay,
                        'institute_code': code,
                        'institute_name': inst_info['institute_name'],
                        'district': inst_info['district'],
                        'region': inst_info['region'],
                        'address': inst_info['address'],
                        'university': univ or inst_info['university'],
                        'institute_status': c_status or inst_info['inst_status'] or inst_meta['directory_status'],
                        'autonomy_status': c_autonomy,
                        'minority_status': c_minority,
                        'choice_code': choice_code,
                        'branch_name_original': course_name,
                        'shift': shift,
                        'gender': gender,
                        'intake_capacity': intake_num,
                        'source_url': detail_url,
                        'source_file': local_file
                    })
                    
                inst_info['course_count'] = len(records)
    except Exception as e:
        print(f"Error parsing {code} ({ay}): {e}")
        
    return inst_info, records


def run_pipeline():
    start_time = time.time()
    all_directory_institutes = []
    
    for ay, config in YEARS_CONFIG.items():
        insts = extract_directory(ay, config)
        all_directory_institutes.extend(insts)
        
    print(f"\nTotal institutes to scrape/parse across 3 years: {len(all_directory_institutes)}")
    
    all_course_records = []
    all_institute_summaries = []
    
    # Use ThreadPoolExecutor to download and parse in parallel
    print("Fetching and parsing institute detail pages...")
    session = requests.Session()
    session.headers.update(HEADERS)
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(parse_institute_summary, inst, session): inst for inst in all_directory_institutes}
        
        completed = 0
        total = len(futures)
        for fut in as_completed(futures):
            inst_info, records = fut.result()
            all_institute_summaries.append(inst_info)
            all_course_records.extend(records)
            completed += 1
            if completed % 150 == 0 or completed == total:
                print(f"Progress: {completed}/{total} institutes processed ({len(all_course_records)} course records extracted)")
                
    # Save raw extractions
    df_courses = pd.DataFrame(all_course_records)
    df_insts = pd.DataFrame(all_institute_summaries)
    
    raw_courses_csv = "data/intake/raw_extracted_courses.csv"
    raw_insts_csv = "data/intake/raw_extracted_institutes.csv"
    
    df_courses.to_csv(raw_courses_csv, index=False, encoding='utf-8')
    df_insts.to_csv(raw_insts_csv, index=False, encoding='utf-8')
    
    elapsed = time.time() - start_time
    print(f"\nExtraction complete in {elapsed:.2f} seconds.")
    print(f"Total raw course records: {len(df_courses)}")
    print(f"Total institute summaries: {len(df_insts)}")
    print(f"Saved: {raw_courses_csv} and {raw_insts_csv}")


if __name__ == '__main__':
    run_pipeline()
