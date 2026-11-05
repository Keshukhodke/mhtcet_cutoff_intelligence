/**
 * Predictor Service - Powered by 397,000+ Official DTE Maharashtra CAP Cutoff Records
 */

export interface CollegeMeta {
  code: number;
  name: string;
  dist: string;
  uni: string;
  auto: boolean;
}

export interface CutoffRowRaw {
  c: number; // college_code
  b: string; // branch_name
  q: string; // quota
  p: (number | null)[]; // [r1, r2, r3, r4, avg]
  r: (number | null)[]; // [r1, r2, r3, r4, avg]
}

export interface PredictorDataPayload {
  colleges: Record<string, CollegeMeta>;
  branches: string[];
  categories: string[];
  rows_2026: CutoffRowRaw[];
  rows_2025: CutoffRowRaw[];
}

export interface PredictorFilterParams {
  examType: 'MHT-CET' | 'JEE-Main';
  predictBy: 'percentile' | 'rank';
  score: number;
  category: string; // OPEN, OBC, SC, ST, VJ/DT, NT-B, NT-C, NT-D, SEBC, SBC
  district: string;
  gender: 'Male' | 'Female';
  isEWS: boolean;
  isTFWS: boolean;
  isPWD: boolean;
  isDEF: boolean;
  isOrphan: boolean;
  includeMinority: boolean;
  selectedBranches: string[];
  selectedDistrictFilter?: string;
  selectedSafetyFilter?: string;
  year?: '2026' | '2025';
  searchTerm?: string;
}

export interface PredictedItem {
  id: string;
  college_code: number;
  college_name: string;
  district: string;
  university: string;
  is_autonomous: boolean;
  branch_name: string;
  quota: string;
  r1_percentile: number | null;
  r2_percentile: number | null;
  r3_percentile: number | null;
  r4_percentile: number | null;
  avg_percentile: number;
  r1_rank: number | null;
  r2_rank: number | null;
  r3_rank: number | null;
  r4_rank: number | null;
  avg_rank: number;
  min_cutoff: number;
  is_eligible: boolean;
  safety: 'Safe' | 'Realistic' | 'Dream' | 'Competitive';
  score_diff: number;
}

// Memory cache for fetched predictor data
let cachedData: PredictorDataPayload | null = null;
let fetchPromise: Promise<PredictorDataPayload> | null = null;

export async function fetchPredictorData(): Promise<PredictorDataPayload> {
  if (cachedData) return cachedData;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/data/predictorData.json')
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Failed to load predictor data: ${res.statusText}`);
      }
      const data: PredictorDataPayload = await res.json();
      cachedData = data;
      return data;
    })
    .catch(err => {
      fetchPromise = null;
      console.error('Error fetching predictor data:', err);
      throw err;
    });

  return fetchPromise;
}

/**
 * Determines university district mapping for Home University (HU) vs Outside University (OU)
 */
export function getUniversityForDistrict(district: string): string {
  const d = district.trim().toLowerCase();
  if (['pune', 'nashik', 'ahilyanagar', 'ahmednagar'].includes(d)) {
    return 'Savitribai Phule Pune University';
  }
  if (['mumbai', 'mumbai city', 'mumbai suburban', 'thane', 'palghar', 'raigad', 'ratnagiri', 'sindhudurg'].includes(d)) {
    return 'Mumbai University';
  }
  if (['nagpur', 'wardha', 'bhandara', 'gondia'].includes(d)) {
    return 'Rashtrasant Tukadoji Maharaj Nagpur University';
  }
  if (['chandrapur', 'gadchiroli'].includes(d)) {
    return 'Gondwana University';
  }
  if (['amravati', 'akola', 'yavatmal', 'buldhana', 'washim'].includes(d)) {
    return 'Sant Gadge Baba Amravati University';
  }
  if (['chhatrapati sambhajinagar', 'aurangabad', 'jalna', 'beed', 'dharashiv', 'osmanabad'].includes(d)) {
    return 'Dr. Babasaheb Ambedkar Marathwada University';
  }
  if (['nanded', 'latur', 'parbhani', 'hingoli'].includes(d)) {
    return 'Swami Ramanand Teerth Marathwada University';
  }
  if (['kolhapur', 'sangli', 'satara'].includes(d)) {
    return 'Shivaji University';
  }
  if (['solapur'].includes(d)) {
    return 'Punyashlok Ahilyadevi Holkar Solapur University';
  }
  if (['jalgaon', 'dhule', 'nandurbar'].includes(d)) {
    return 'Kavayitri Bahinabai Chaudhari North Maharashtra University';
  }
  return 'Maharashtra State Level';
}

/**
 * Computes all seat quotas a student can legally compete for in Maharashtra CAP
 * based on Caste Category, 12th District, Gender, and Special Quotas.
 */
export function computeEligibleQuotas(params: {
  examType: 'MHT-CET' | 'JEE-Main';
  category: string;
  gender: 'Male' | 'Female';
  isEWS: boolean;
  isTFWS: boolean;
  isPWD: boolean;
  isDEF: boolean;
  isOrphan: boolean;
  includeMinority: boolean;
}): string[] {
  if (params.examType === 'JEE-Main') {
    const jeeQuotas = ['AI'];
    if (params.includeMinority) jeeQuotas.push('MI-AI', 'MI');
    return jeeQuotas;
  }

  const quotas = new Set<string>();

  // 1. General Open Seats - available to everyone in Maharashtra
  quotas.add('GOPENS');
  quotas.add('OPEN');
  quotas.add('GOPENH');
  quotas.add('GOPENO');

  // Ladies Open Seats if Female
  if (params.gender === 'Female') {
    quotas.add('LOPENS');
    quotas.add('LOPENH');
    quotas.add('LOPENO');
    quotas.add('LOPEN');
  }

  // 2. Category Quotas
  const cat = params.category.toUpperCase();
  if (cat === 'OBC') {
    quotas.add('GOBCS');
    quotas.add('GOBCH');
    quotas.add('GOBCO');
    quotas.add('OBC');
    if (params.gender === 'Female') {
      quotas.add('LOBCS');
      quotas.add('LOBCH');
      quotas.add('LOBCO');
    }
  } else if (cat === 'SC') {
    quotas.add('GSCS');
    quotas.add('GSCH');
    quotas.add('GSCO');
    quotas.add('SC');
    if (params.gender === 'Female') {
      quotas.add('LSCS');
      quotas.add('LSCH');
      quotas.add('LSCO');
    }
  } else if (cat === 'ST') {
    quotas.add('GSTS');
    quotas.add('GSTH');
    quotas.add('GSTO');
    quotas.add('ST');
    if (params.gender === 'Female') {
      quotas.add('LSTS');
      quotas.add('LSTH');
      quotas.add('LSTO');
    }
  } else if (cat === 'VJ/DT' || cat === 'NT-A' || cat === 'VJ') {
    quotas.add('GVJAS');
    quotas.add('GVJAH');
    quotas.add('GVJAO');
    quotas.add('GVJA');
    quotas.add('VJ');
    if (params.gender === 'Female') {
      quotas.add('LVJAS');
      quotas.add('LVJAH');
      quotas.add('LVJAO');
    }
  } else if (cat === 'NT-B' || cat === 'NT1') {
    quotas.add('GNT1S');
    quotas.add('GNT1H');
    quotas.add('GNT1O');
    quotas.add('GNTBS');
    quotas.add('NTB');
    quotas.add('NT1');
    if (params.gender === 'Female') {
      quotas.add('LNT1S');
      quotas.add('LNT1H');
      quotas.add('LNT1O');
      quotas.add('LNTBS');
    }
  } else if (cat === 'NT-C' || cat === 'NT2') {
    quotas.add('GNT2S');
    quotas.add('GNT2H');
    quotas.add('GNT2O');
    quotas.add('GNTCS');
    quotas.add('NTC');
    quotas.add('NT2');
    if (params.gender === 'Female') {
      quotas.add('LNT2S');
      quotas.add('LNT2H');
      quotas.add('LNT2O');
      quotas.add('LNTCS');
    }
  } else if (cat === 'NT-D' || cat === 'NT3') {
    quotas.add('GNT3S');
    quotas.add('GNT3H');
    quotas.add('GNT3O');
    quotas.add('GNTDS');
    quotas.add('NTD');
    quotas.add('NT3');
    if (params.gender === 'Female') {
      quotas.add('LNT3S');
      quotas.add('LNT3H');
      quotas.add('LNT3O');
      quotas.add('LNTDS');
    }
  } else if (cat === 'SEBC') {
    quotas.add('GSEBCS');
    quotas.add('GSEBCH');
    quotas.add('GSEBCO');
    quotas.add('SEBC');
    if (params.gender === 'Female') {
      quotas.add('LSEBCS');
      quotas.add('LSEBCH');
      quotas.add('LSEBCO');
    }
  } else if (cat === 'SBC') {
    quotas.add('SBC');
    quotas.add('GSBCS');
    quotas.add('GSBCH');
    quotas.add('GSBCO');
    if (params.gender === 'Female') {
      quotas.add('LSBCS');
      quotas.add('LSBCH');
    }
  }

  // 3. Special Quotas
  if (params.isEWS) {
    quotas.add('EWS');
    quotas.add('GEWS');
    if (params.gender === 'Female') {
      quotas.add('LEWS');
    }
  }

  if (params.isTFWS) {
    quotas.add('TFWS');
    quotas.add('GTFWS');
  }

  if (params.isPWD) {
    quotas.add('PWDOPENS');
    quotas.add('PWDOPENH');
    quotas.add('PWDOBCS');
    quotas.add('PWDSCS');
    quotas.add('PWDSTS');
  }

  if (params.isDEF) {
    quotas.add('DEFOPENS');
    quotas.add('DEFOPENH');
    quotas.add('DEFOBCS');
    quotas.add('DEFSCS');
    quotas.add('DEFNT1S');
    quotas.add('DEFNT2S');
  }

  if (params.isOrphan) {
    quotas.add('ORPHAN');
  }

  if (params.includeMinority) {
    quotas.add('MI');
    quotas.add('MI-MH');
  }

  return Array.from(quotas);
}

/**
 * Predict matched colleges with R1, R2, R3, R4, and AVG Cutoffs
 */
export function predictColleges(
  data: PredictorDataPayload,
  params: PredictorFilterParams
): PredictedItem[] {
  const eligibleQuotas = new Set(
    computeEligibleQuotas({
      examType: params.examType,
      category: params.category,
      gender: params.gender,
      isEWS: params.isEWS,
      isTFWS: params.isTFWS,
      isPWD: params.isPWD,
      isDEF: params.isDEF,
      isOrphan: params.isOrphan,
      includeMinority: params.includeMinority
    })
  );

  const studentHomeUni = getUniversityForDistrict(params.district);
  const rows = params.year === '2025' ? data.rows_2025 : data.rows_2026;
  const isPercentile = params.predictBy === 'percentile';
  const score = params.score;

  const branchFilterSet =
    params.selectedBranches && params.selectedBranches.length > 0
      ? new Set(params.selectedBranches.map(b => b.toLowerCase()))
      : null;

  const searchWords = params.searchTerm
    ? params.searchTerm.toLowerCase().trim().split(/\s+/)
    : null;

  const results: PredictedItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const quota = row.q;

    // Check eligible quota
    if (!eligibleQuotas.has(quota)) {
      continue;
    }

    const col = data.colleges[row.c];
    if (!col) continue;

    // HU / OU Zone Consistency Filter:
    // If quota is GOPENH/GOBCH (Home Uni), college university MUST match student's home university!
    // If quota is GOPENO/GOBCO (Other Uni), college university MUST NOT match student's home university!
    if (quota.endsWith('H') && col.uni !== studentHomeUni && !col.auto) {
      continue;
    }
    if (quota.endsWith('O') && col.uni === studentHomeUni && !col.auto) {
      continue;
    }

    // Branch filter
    if (branchFilterSet && !branchFilterSet.has(row.b.toLowerCase())) {
      continue;
    }

    // District filter
    if (params.selectedDistrictFilter && params.selectedDistrictFilter !== 'All') {
      if (col.dist !== params.selectedDistrictFilter) {
        continue;
      }
    }

    // Search term filter
    if (searchWords) {
      const targetStr = `${col.name} ${col.dist} ${col.uni} ${row.b} ${quota}`.toLowerCase();
      const matchesAll = searchWords.every(word => targetStr.includes(word));
      if (!matchesAll) continue;
    }

    // Extract percentiles or ranks
    const p = row.p;
    const r = row.r;

    const r1_p = p[0];
    const r2_p = p[1];
    const r3_p = p[2];
    const r4_p = p[3];
    const avg_p = p[4] || 0;

    const r1_r = r[0];
    const r2_r = r[1];
    const r3_r = r[2];
    const r4_r = r[3];
    const avg_r = r[4] || 0;

    // Eligibility check across rounds (as EduVale specifies: chance if score >= cutoff in ANY round)
    let isEligible = false;
    let minCutoff = 0;
    let scoreDiff = 0;
    let safety: 'Safe' | 'Realistic' | 'Dream' | 'Competitive' = 'Realistic';

    if (isPercentile) {
      const validRoundCutoffs = [r1_p, r2_p, r3_p, r4_p].filter((x): x is number => x !== null);
      if (validRoundCutoffs.length === 0) continue;

      minCutoff = Math.min(...validRoundCutoffs);
      isEligible = score >= minCutoff;

      scoreDiff = Number((score - avg_p).toFixed(3));
      if (scoreDiff >= 1.5) {
        safety = 'Safe';
      } else if (scoreDiff >= -1.5) {
        safety = 'Realistic';
      } else if (scoreDiff >= -5.0) {
        safety = 'Dream';
      } else {
        safety = 'Competitive';
      }
    } else {
      // Merit Rank mode (lower rank = better)
      const validRanks = [r1_r, r2_r, r3_r, r4_r].filter((x): x is number => x !== null);
      if (validRanks.length === 0) continue;

      const maxCutoffRank = Math.max(...validRanks);
      isEligible = score <= maxCutoffRank;
      scoreDiff = avg_r - score; // positive means student rank is better (lower) than cutoff

      if (score <= avg_r * 0.85 || scoreDiff >= 2000) {
        safety = 'Safe';
      } else if (score <= avg_r * 1.08 || scoreDiff >= -1500) {
        safety = 'Realistic';
      } else if (score <= avg_r * 1.35) {
        safety = 'Dream';
      } else {
        safety = 'Competitive';
      }
    }

    // Filter by safety tier if selected
    if (params.selectedSafetyFilter && params.selectedSafetyFilter !== 'All') {
      if (safety !== params.selectedSafetyFilter) {
        continue;
      }
    }

    // Only include rows where student has a reasonable chance (or all eligible)
    if (isEligible) {
      results.push({
        id: `${col.code}_${row.b}_${quota}`,
        college_code: col.code,
        college_name: col.name,
        district: col.dist,
        university: col.uni,
        is_autonomous: col.auto,
        branch_name: row.b,
        quota,
        r1_percentile: r1_p,
        r2_percentile: r2_p,
        r3_percentile: r3_p,
        r4_percentile: r4_p,
        avg_percentile: avg_p,
        r1_rank: r1_r,
        r2_rank: r2_r,
        r3_rank: r3_r,
        r4_rank: r4_r,
        avg_rank: avg_r,
        min_cutoff: minCutoff,
        is_eligible: isEligible,
        safety,
        score_diff: scoreDiff
      });
    }
  }

  // Sort descending by avg_percentile by default (or ascending by avg_rank)
  if (isPercentile) {
    results.sort((a, b) => b.avg_percentile - a.avg_percentile);
  } else {
    results.sort((a, b) => a.avg_rank - b.avg_rank);
  }

  return results;
}
