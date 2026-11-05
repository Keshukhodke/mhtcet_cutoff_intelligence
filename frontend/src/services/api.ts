import { College, ModelMetricsData, PreferenceHealthMetrics, PreferenceItem, StudentProfile, ReachabilityLevel } from '../types';
import collegesSeed from '../data/collegesData.json';
import modelMetricsSeed from '../data/modelMetrics.json';
import categoriesSeed from '../data/categoryData.json';
import branchesSeed from '../data/branchData.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IS_BACKEND_CONFIGURED = Boolean(API_BASE_URL);

/**
 * Calculates rule-based explainable reachability.
 * Reachable: studentPercentile >= predictedCutoff + 1.5
 * Borderline: studentPercentile is within [predictedCutoff - 2.0, predictedCutoff + 1.5)
 * Ambitious: studentPercentile is within [predictedCutoff - 6.0, predictedCutoff - 2.0)
 * Very Low: studentPercentile < predictedCutoff - 6.0
 */
export function calculateReachability(studentPercentile: number, predictedCutoff: number): {
  level: ReachabilityLevel;
  diff: number;
  explanation: string;
} {
  const diff = Number((studentPercentile - predictedCutoff).toFixed(2));
  
  if (diff >= 1.5) {
    return {
      level: 'Reachable',
      diff,
      explanation: `Your percentile (${studentPercentile}) is safely +${diff} points above the predicted cutoff (${predictedCutoff}). High probability of allocation in CAP Round 1 or 2.`
    };
  } else if (diff >= -2.0) {
    return {
      level: 'Borderline',
      diff,
      explanation: `Your percentile (${studentPercentile}) is within ±2 points (${diff >= 0 ? '+' : ''}${diff}) of the forecast (${predictedCutoff}). Strong realistic candidate; allocation depends on seat demand movement.`
    };
  } else if (diff >= -6.0) {
    return {
      level: 'Ambitious',
      diff,
      explanation: `Your percentile (${studentPercentile}) is ${Math.abs(diff)} points below the predicted cutoff (${predictedCutoff}). Suitable as an ambitious/dream preference for earlier rounds.`
    };
  } else {
    return {
      level: 'Very Low',
      diff,
      explanation: `Your percentile (${studentPercentile}) is ${Math.abs(diff)} points below the cutoff (${predictedCutoff}). Historically very low probability; consider safer alternatives.`
    };
  }
}

/**
 * Centralized API Service
 */
export const api = {
  isLiveBackend(): boolean {
    return IS_BACKEND_CONFIGURED;
  },

  async getHealth(): Promise<{ status: string; version: string; mode: string }> {
    if (IS_BACKEND_CONFIGURED) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to local dataset.', err);
      }
    }
    return {
      status: 'healthy',
      version: '1.0.0-verified',
      mode: 'Local Verified ML Dataset'
    };
  },

  async getModelMetadata(): Promise<ModelMetricsData> {
    if (IS_BACKEND_CONFIGURED) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/metadata`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Failed to fetch remote metadata, using local metrics.', err);
      }
    }
    return modelMetricsSeed as unknown as ModelMetricsData;
  },

  async getColleges(): Promise<College[]> {
    if (IS_BACKEND_CONFIGURED) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/colleges`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Failed to fetch remote colleges, using local dataset.', err);
      }
    }
    return collegesSeed as unknown as College[];
  },

  async getCategories() {
    return categoriesSeed;
  },

  async getBranches() {
    return branchesSeed;
  },

  /**
   * Rule-based Preference List Health Analyzer
   */
  analyzePreferenceList(items: PreferenceItem[], profile?: StudentProfile | null): PreferenceHealthMetrics {
    const total = items.length;
    if (total === 0) {
      return {
        totalChoices: 0,
        uniqueCollegesCount: 0,
        uniqueBranchesCount: 0,
        uniqueDistrictsCount: 0,
        reachableCount: 0,
        borderlineCount: 0,
        ambitiousCount: 0,
        veryLowCount: 0,
        warnings: ['Your preference list is currently empty. Add at least 15-20 college choices across reachability tiers.'],
        suggestions: ['Start by exploring colleges in your preferred district and adding 5 ambitious, 10 realistic, and 5 safe options.'],
        concentrationRisk: 'Low',
        reachabilityBalance: 'Balanced'
      };
    }

    const uniqueColleges = new Set(items.map(i => i.college_code)).size;
    const uniqueBranches = new Set(items.map(i => i.branch_name)).size;
    const uniqueDistricts = new Set(items.map(i => i.district)).size;

    const reachable = items.filter(i => i.reachability === 'Reachable').length;
    const borderline = items.filter(i => i.reachability === 'Borderline').length;
    const ambitious = items.filter(i => i.reachability === 'Ambitious').length;
    const veryLow = items.filter(i => i.reachability === 'Very Low').length;

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Diagnostics
    if (total < 10) {
      warnings.push(`You only have ${total} choices. MHT-CET CAP allows up to 300 options; having under 10 increases the risk of not getting any allotment.`);
    }

    if (reachable === 0) {
      warnings.push('CRITICAL: You have zero "Reachable" (safe) colleges in your list! You risk remaining unallocated in CAP Round 1.');
      suggestions.push('Add at least 4 to 6 colleges whose cutoffs are 2+ percentile points below your score.');
    } else if (reachable < 3 && total > 8) {
      warnings.push('Low safety buffer: You have fewer than 3 safe colleges. Add more backup choices.');
    }

    if (ambitious + veryLow > total * 0.7 && total >= 5) {
      warnings.push('Overly aggressive list: Over 70% of your choices are Ambitious or Very Low reachability.');
      suggestions.push('Balance your list with more Realistic/Borderline options to secure admission.');
    }

    // Concentration Risk
    let concentrationRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (total >= 5 && uniqueColleges <= 2) {
      concentrationRisk = 'High';
      warnings.push(`High Institute Concentration: You have ${total} choices distributed across only ${uniqueColleges} institutes.`);
      suggestions.push('Broaden your options by including 3 to 5 additional autonomous or reputed colleges.');
    } else if (total >= 8 && uniqueColleges <= 4) {
      concentrationRisk = 'Medium';
      suggestions.push('Consider diversifying into nearby institutes with similar branch placements.');
    }

    // Reachability balance assessment
    let reachabilityBalance: 'Balanced' | 'Too Risky' | 'Too Conservative' = 'Balanced';
    if (reachable + borderline === 0 && total >= 3) {
      reachabilityBalance = 'Too Risky';
    } else if (ambitious === 0 && reachable > total * 0.8 && total >= 5) {
      reachabilityBalance = 'Too Conservative';
      suggestions.push('You have a strong score! Consider adding 2-3 top-tier dream colleges at the top of your list (Preferences #1 to #3).');
    }

    return {
      totalChoices: total,
      uniqueCollegesCount: uniqueColleges,
      uniqueBranchesCount: uniqueBranches,
      uniqueDistrictsCount: uniqueDistricts,
      reachableCount: reachable,
      borderlineCount: borderline,
      ambitiousCount: ambitious,
      veryLowCount: veryLow,
      warnings,
      suggestions,
      concentrationRisk,
      reachabilityBalance
    };
  }
};
