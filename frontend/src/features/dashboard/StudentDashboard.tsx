import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Compass,
  ListOrdered,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Building2,
  Bookmark
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import { MetricCard } from '../../components/common/MetricCard';
import { ReachabilityBadge } from '../../components/common/ReachabilityBadge';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';
import { AdmissionToolsHub } from '../../components/common/AdmissionToolsHub';
import { api, calculateReachability } from '../../services/api';
import { College } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { profile } = useStudent();
  const { preferences } = usePreferences();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getColleges().then(data => {
      setColleges(data);
      setLoading(false);
    });
  }, []);

  // Compute matching colleges and reachability counts
  let safeCount = 0;
  let targetCount = 0;
  let ambitiousCount = 0;
  let matchingCollegesCount = 0;

  colleges.forEach(col => {
    const hasMatchingBranch = col.branches.some(b => {
      const isPreferred = profile.preferredBranches.length === 0 || profile.preferredBranches.includes(b.branch_name);
      if (!isPreferred) return false;

      const reach = calculateReachability(profile.percentile, b.predicted_cutoff);
      if (reach.level === 'Reachable') safeCount++;
      else if (reach.level === 'Borderline') targetCount++;
      else if (reach.level === 'Ambitious') ambitiousCount++;
      return true;
    });

    if (hasMatchingBranch) matchingCollegesCount++;
  });

  const health = api.analyzePreferenceList(preferences, profile);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Student Admission Intelligence
            </span>
            <span className="text-slate-300">•</span>
            <DataFreshnessIndicator />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, MHT-CET Aspirant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Academic Year <strong>2026-2027</strong> • CAP Admission Forecast Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/predictor"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>College Predictor 2026</span>
          </Link>
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Explore Colleges</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
                CET
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  MHT-CET Percentile
                </span>
                <p className="text-xl font-extrabold text-slate-900 leading-none mt-0.5">
                  {profile.percentile ? `${profile.percentile.toFixed(2)} %ile` : 'Not Set'}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-medium">Category & Quota</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded">
                  {profile.category}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {profile.domicile.split(' ')[0]}
                </span>
                {profile.isTFWS && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded">
                    TFWS Eligible
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-200 pl-4 hidden sm:flex">
              <span className="text-xs text-slate-500 font-medium">Home University</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate max-w-xs">
                {profile.homeUniversity}
              </p>
            </div>
          </div>

          {/* Quick preference count */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex flex-col text-right">
              <span className="text-xs text-slate-500 font-medium">Preference List</span>
              <span className="text-sm font-bold text-slate-900">
                {preferences.length} Colleges Added
              </span>
            </div>
            <Link
              to="/preference-builder"
              className="p-2 bg-white rounded-md border border-slate-300 text-slate-700 hover:text-brand-600 hover:border-brand-300 transition-colors"
              title="Open Preference Builder"
            >
              <ListOrdered className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Matching Colleges"
          value={loading ? '...' : matchingCollegesCount}
          subtitle={`Based on ${profile.preferredDistricts.length} preferred districts`}
          icon={<Building2 className="w-4 h-4" />}
          className="border-slate-200"
        />

        <MetricCard
          title="Reachable (Safe)"
          value={loading ? '...' : safeCount}
          subtitle="Cutoff is +1.5% below your score"
          badge={<ReachabilityBadge level="Reachable" size="sm" />}
        />

        <MetricCard
          title="Borderline (Target)"
          value={loading ? '...' : targetCount}
          subtitle="Cutoff is within ±2% of your score"
          badge={<ReachabilityBadge level="Borderline" size="sm" />}
        />

        <MetricCard
          title="Ambitious (Dream)"
          value={loading ? '...' : ambitiousCount}
          subtitle="Competitive stretch colleges"
          badge={<ReachabilityBadge level="Ambitious" size="sm" />}
        />
      </div>

      {/* 4. MHT CET Admission Tools Hub Suite */}
      <AdmissionToolsHub />

      {/* 5. Action Banner & Health Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recommended Next Step Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Strategic Recommendation
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              {preferences.length === 0
                ? 'Your CAP Preference List is empty'
                : health.reachabilityBalance === 'Too Risky'
                ? 'Warning: Your preference list is heavily weighted towards Ambitious choices'
                : 'Keep refining your branch choices for CAP Round 1'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {preferences.length === 0
                ? 'Under MHT-CET admission rules, not adding enough safe colleges increases the danger of non-allocation in early rounds. Start by bookmarking 5 ambitious, 8 target, and 5 safe options in College Explorer.'
                : health.suggestions[0] || 'Ensure your top 3 choices represent your dream aspirations, followed by a robust middle-tier safety net.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <span>Explore Matching Colleges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/preference-health"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit Preference List Health</span>
            </Link>
          </div>
        </div>

        {/* Right: Preference Health Mini Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                List Health Status
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  preferences.length === 0
                    ? 'bg-slate-100 text-slate-600'
                    : health.reachabilityBalance === 'Balanced'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {preferences.length === 0 ? 'Not Started' : health.reachabilityBalance}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Choices</span>
                <span className="font-semibold text-slate-800">{preferences.length} / 300</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Unique Institutes</span>
                <span className="font-semibold text-slate-800">{health.uniqueCollegesCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Safe / Backup Options</span>
                <span className="font-semibold text-emerald-600">{health.reachableCount}</span>
              </div>
            </div>

            {health.warnings.length > 0 && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{health.warnings[0]}</span>
              </div>
            )}
          </div>

          <Link
            to="/preference-builder"
            className="mt-4 block text-center py-2 px-3 bg-slate-50 hover:bg-slate-100 text-brand-600 font-semibold text-xs rounded-lg border border-slate-200 transition-colors"
          >
            Manage Preferences List ({preferences.length})
          </Link>
        </div>
      </div>

      {/* 5. Key Market Insights Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <span>MHT-CET CAP 2026 Cutoff Movement Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">CAP1 Structural Offset (+5.30%)</strong>
            Historically, Round 1 cutoffs open approximately 5.30 percentile points higher than final closing rounds due to initial seat competition.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">Computer &amp; AI/DS Demand</strong>
            CS, IT, and AI &amp; DS branches maintain tight cutoff spreads, with elite institutes (VJTI, COEP, PICT) closing above the 98.5th percentile.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">Branch Intake Expansion</strong>
            Colleges with approved intake expansions (e.g. +60 AI seats) show moderate stabilization in later round cutoffs.
          </div>
        </div>
      </div>
    </div>
  );
};
