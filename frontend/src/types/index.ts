export type ReachabilityLevel = 'Reachable' | 'Borderline' | 'Ambitious' | 'Very Low';

export interface CategoryCutoffDetail {
  previous_cutoff: number;
  predicted_cutoff: number;
  lower_bound: number;
  upper_bound: number;
  seat_section?: string;
}

export interface CutoffTrendPoint {
  year: string;
  round: string;
  cutoff: number;
  isForecast?: boolean;
}

export interface Branch {
  branch_code: number;
  branch_name: string;
  predicted_cutoff: number;
  previous_cutoff: number;
  intake: number;
  category_cutoffs: Record<string, CategoryCutoffDetail>;
  trend: CutoffTrendPoint[];
}

export interface College {
  college_code: number;
  college_name: string;
  district: string;
  institute_type: string;
  branches_count: number;
  branches: Branch[];
}

export interface StudentProfile {
  examYear: number;
  percentile: number;
  rank: number | null;
  category: string;
  gender: 'Male' | 'Female' | 'Other';
  homeUniversity: string;
  domicile: string;
  isTFWS: boolean;
  isEWS: boolean;
  minorityStatus: string;
  specialQuota: string; // None, PWD, DEF, ORPHAN
  preferredBranches: string[];
  preferredDistricts: string[];
  preferredInstituteTypes: string[];
  isCompleted: boolean;
}

export interface PreferenceItem {
  id: string;
  preferenceNumber: number;
  college_code: number;
  college_name: string;
  branch_code: number;
  branch_name: string;
  district: string;
  institute_type: string;
  category: string;
  previous_cutoff: number;
  predicted_cutoff: number;
  lower_bound: number;
  upper_bound: number;
  intake: number;
  reachability: ReachabilityLevel;
  reachabilityDiff: number;
  addedAt: string;
}

export interface PreferenceHealthMetrics {
  totalChoices: number;
  uniqueCollegesCount: number;
  uniqueBranchesCount: number;
  uniqueDistrictsCount: number;
  reachableCount: number;
  borderlineCount: number;
  ambitiousCount: number;
  veryLowCount: number;
  warnings: string[];
  suggestions: string[];
  concentrationRisk: 'Low' | 'Medium' | 'High';
  reachabilityBalance: 'Balanced' | 'Too Risky' | 'Too Conservative';
}

export interface ModelMetricsData {
  model_name: string;
  architecture: string;
  calibration_offset: string;
  training_records: number;
  testing_records: number;
  metrics: {
    MAE: number;
    MedAE: number;
    RMSE: number;
    R2: number;
    SMAPE: number;
    within_1_pct: number;
    within_2_pct: number;
    within_5_pct: number;
    elite_colleges_within_5_pct: number;
    elite_colleges_medae: number;
  };
  data_version: string;
  last_updated: string;
  limitations: string[];
}
