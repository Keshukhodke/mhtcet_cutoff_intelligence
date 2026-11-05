import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { ModelMetricsData } from '../../types';

interface ModelMetricsPanelProps {
  metrics: ModelMetricsData;
  className?: string;
}

export const ModelMetricsPanel: React.FC<ModelMetricsPanelProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{metrics.model_name}</h3>
            <p className="text-xs text-slate-500">{metrics.architecture}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Production Ready • R² {metrics.metrics.R2.toFixed(3)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-slate-100">
        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Median Error</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            ±{metrics.metrics.MedAE.toFixed(2)}%
          </p>
          <span className="text-[11px] text-slate-400">Typical deviation</span>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Mean Abs Error</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {metrics.metrics.MAE.toFixed(2)} pts
          </p>
          <span className="text-[11px] text-slate-400">Overall MAE</span>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Elite Colleges (&gt;95)</span>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {metrics.metrics.elite_colleges_within_5_pct}%
          </p>
          <span className="text-[11px] text-emerald-700">Within ±5 pts</span>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Evaluated Rows</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {metrics.testing_records.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">2026 CAP1 Test Records</span>
        </div>
      </div>

      <div className="pt-3.5">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-700">Data Integrity Notice: </strong>
            Predictions represent machine-learning transition forecasts from previous closing CAP rounds to opening CAP1. Official allotment depends on applicant pool volume, category reservation rules, and official CET Cell seat matrix.
          </p>
        </div>
      </div>
    </div>
  );
};
