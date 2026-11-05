import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Building2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { usePreferences } from '../../context/PreferenceContext';
import { useStudent } from '../../context/StudentContext';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';

export const PreferenceHealth: React.FC = () => {
  const { preferences } = usePreferences();
  const { profile } = useStudent();

  const health = api.analyzePreferenceList(preferences, profile);

  // Calculate percentage distribution
  const total = health.totalChoices || 1;
  const safePct = Math.round((health.reachableCount / total) * 100);
  const targetPct = Math.round((health.borderlineCount / total) * 100);
  const ambitiousPct = Math.round((health.ambitiousCount / total) * 100);
  const veryLowPct = Math.round((health.veryLowCount / total) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Decision Support &amp; Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Preference List Health Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rule-based risk diagnostic inspecting reachability coverage, concentration risk, and diversity across your choices.
          </p>
        </div>

        <Link
          to="/preference-builder"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Open Option Form</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Top Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Choices"
          value={`${health.totalChoices} / 300`}
          subtitle="Max choices allowed: 300"
          className="border-slate-200"
        />

        <MetricCard
          title="Institute Diversity"
          value={health.uniqueCollegesCount}
          subtitle={`Across ${health.uniqueDistrictsCount} geographic hubs`}
          icon={<Building2 className="w-4 h-4" />}
        />

        <MetricCard
          title="Branch Diversity"
          value={health.uniqueBranchesCount}
          subtitle="Engineering disciplines"
          icon={<Layers className="w-4 h-4" />}
        />

        <MetricCard
          title="Risk Assessment"
          value={health.totalChoices === 0 ? 'Empty' : health.reachabilityBalance}
          subtitle={`Concentration Risk: ${health.concentrationRisk}`}
          badge={
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                health.totalChoices === 0
                  ? 'bg-slate-100 text-slate-600'
                  : health.reachabilityBalance === 'Balanced'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {health.reachabilityBalance}
            </span>
          }
        />
      </div>

      {/* 3. Coverage Balance Bar Visualizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Reachability Distribution Across Your Preferences</span>
          <span className="text-slate-500">{health.totalChoices} Choices Total</span>
        </div>

        {health.totalChoices === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
            Add colleges to view your reachability distribution bar.
          </div>
        ) : (
          <>
            {/* Visual stacked bar */}
            <div className="h-5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${safePct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Safe (Reachable): ${health.reachableCount} (${safePct}%)`}
              />
              <div
                style={{ width: `${targetPct}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Target (Borderline): ${health.borderlineCount} (${targetPct}%)`}
              />
              <div
                style={{ width: `${ambitiousPct}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Ambitious (Dream): ${health.ambitiousCount} (${ambitiousPct}%)`}
              />
              <div
                style={{ width: `${veryLowPct}%` }}
                className="bg-slate-400 h-full transition-all"
                title={`Very Low: ${health.veryLowCount} (${veryLowPct}%)`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600">Reachable: <strong>{health.reachableCount} ({safePct}%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600">Borderline: <strong>{health.borderlineCount} ({targetPct}%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-600">Ambitious: <strong>{health.ambitiousCount} ({ambitiousPct}%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span className="text-slate-600">Very Low: <strong>{health.veryLowCount} ({veryLowPct}%)</strong></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Actionable Diagnostics: Warnings & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warnings & Risk Flags */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <span>Diagnostic Risk Flags ({health.warnings.length})</span>
          </h3>

          {health.warnings.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Great job! No major structural risks detected in your preference list.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {health.warnings.map((warn, i) => (
                <div key={i} className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Suggestions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Actionable Next Steps</span>
          </h3>

          <div className="space-y-2.5">
            {health.suggestions.length === 0 ? (
              <p className="text-xs text-slate-500">Your list meets core stability criteria.</p>
            ) : (
              health.suggestions.map((sug, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{sug}</span>
                </div>
              ))
            )}

            <div className="pt-2">
              <Link
                to="/explorer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Search Additional Colleges to Balance List</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Health Diagnostic Methodology Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Diagnostic Methodology &amp; Criteria</span>
        </h4>
        <p className="leading-relaxed">
          The Health Analyzer evaluates your list against proven Maharashtra CAP allotment criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Safety Buffer Check</strong>: Verifies that at least 20-30% of choices have cutoffs safely below your percentile.</li>
          <li><strong>Overconcentration Audit</strong>: Flags when more than 50% of your choices reside in only 1 or 2 colleges.</li>
          <li><strong>Volume Rule</strong>: Recommends at least 15-25 choices so that unexpected cutoff spikes do not result in a blank allocation.</li>
        </ul>
      </div>
    </div>
  );
};
