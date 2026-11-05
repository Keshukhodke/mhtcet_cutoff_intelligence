import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

interface DataFreshnessProps {
  lastUpdated?: string;
  recordsCount?: number;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessProps> = ({
  lastUpdated = '2026-10-22',
  recordsCount = 397152
}) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-200 text-slate-700 text-xs rounded-full">
      <Database className="w-3.5 h-3.5 text-brand-600" />
      <span className="font-medium">
        MHT-CET Verified Data ({recordsCount.toLocaleString()} Cutoffs)
      </span>
      <span className="text-slate-400">•</span>
      <span className="flex items-center gap-1 text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Audited {lastUpdated}
      </span>
    </div>
  );
};
