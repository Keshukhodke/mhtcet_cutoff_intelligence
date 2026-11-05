import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import { api } from '../../services/api';
import { ModelMetricsData } from '../../types';
import { ModelMetricsPanel } from '../../components/common/ModelMetricsPanel';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';

export const SettingsPage: React.FC = () => {
  const { profile, resetProfile } = useStudent();
  const { preferences, clearPreferences } = usePreferences();
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsData | null>(null);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    api.getModelMetadata().then(setModelMetrics);
  }, []);

  const handleResetAll = () => {
    if (confirm('This will reset your student profile and clear all saved college preferences. Proceed?')) {
      resetProfile();
      clearPreferences();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            System Preferences
          </span>
          <span className="text-slate-300">•</span>
          <DataFreshnessIndicator />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings &amp; Data Transparency
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect data origin pipelines, verifiable ML accuracy metrics, and manage your local data privacy.
        </p>
      </div>

      {/* 2. Model & Verification Panel */}
      {modelMetrics && <ModelMetricsPanel metrics={modelMetrics} />}

      {/* 3. Data Source Architecture Description */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Database className="w-4 h-4 text-brand-600" />
          <span>Data Extraction, Cleaning &amp; Quarantine Governance</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The underlying dataset represents the complete engineering CAP cutoff archive for Maharashtra from <strong>2022-2023 through 2026-2027</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-800 block mb-1">Source-Level Cleaning</strong>
            PDF extraction errors repaired using boundary-limited forward/backward fills. Over 12,900 missing category headers recovered.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-800 block mb-1">Quarantine Engine</strong>
            Rows with mathematically impossible bounds (e.g. Rank ≤ 0 or corrupt chunks) segregated to prevent ML contamination.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-800 block mb-1">Zero Imputation</strong>
            No artificial statistical mean/mode imputation was applied to ranks or percentiles. All rows represent genuine published boundaries.
          </div>
        </div>
      </div>

      {/* 4. Local Privacy & Storage Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Privacy &amp; Local Storage Controls</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your score, category, and preference list are saved locally in your browser’s <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">localStorage</code>. No personal information or exam credentials are sold or shared with third-party advertisers.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">Reset Application State</span>
            <span className="text-[11px] text-slate-500">
              Clear saved student profile ({profile.category}) and reset {preferences.length} preferences.
            </span>
          </div>

          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Local Cache</span>
          </button>
        </div>

        {resetDone && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Local data cleared successfully. Default demo profile restored.</span>
          </div>
        )}
      </div>

      {/* 5. Legal & Admissions Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Statutory Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          Aapla katta College Predictor is an academic data analytics platform designed for informational decision support. Admission seat allotment is exclusively regulated by the Government of Maharashtra State Common Entrance Test Cell under relevant rules and published seat matrices. Cutoff forecasts do not create legal rights or admission guarantees.
        </p>
      </div>
    </div>
  );
};
