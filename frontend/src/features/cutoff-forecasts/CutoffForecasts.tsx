import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Sparkles,
  Building2,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ShieldCheck,
  Plus,
  Check
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import { api, calculateReachability } from '../../services/api';
import { College, Branch, ModelMetricsData } from '../../types';
import { ReachabilityBadge } from '../../components/common/ReachabilityBadge';
import { ModelMetricsPanel } from '../../components/common/ModelMetricsPanel';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';

export const CutoffForecasts: React.FC = () => {
  const { profile } = useStudent();
  const { addPreference, isInPreferences } = usePreferences();

  const [colleges, setColleges] = useState<College[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsData | null>(null);
  const [selectedCollegeCode, setSelectedCollegeCode] = useState<number>(6006); // Default COEP
  const [selectedBranchName, setSelectedBranchName] = useState<string>('Computer Engineering');
  const [selectedCategory, setSelectedCategory] = useState<string>(profile.category || 'GOPENS');
  const [targetRound, setTargetRound] = useState<string>('CAP1');

  useEffect(() => {
    Promise.all([api.getColleges(), api.getModelMetadata()]).then(([cols, meta]) => {
      setColleges(cols);
      setModelMetrics(meta);
      if (cols.length > 0 && !cols.some(c => c.college_code === 6006)) {
        setSelectedCollegeCode(cols[0].college_code);
        if (cols[0].branches.length > 0) {
          setSelectedBranchName(cols[0].branches[0].branch_name);
        }
      }
    });
  }, []);

  const currentCollege = colleges.find(c => c.college_code === selectedCollegeCode) || colleges[0];
  const currentBranch =
    currentCollege?.branches.find(b => b.branch_name === selectedBranchName) || currentCollege?.branches[0];

  const catData = currentBranch?.category_cutoffs[selectedCategory] || {
    previous_cutoff: currentBranch?.previous_cutoff || 85.0,
    predicted_cutoff: currentBranch?.predicted_cutoff || 90.3,
    lower_bound: Number(((currentBranch?.predicted_cutoff || 90.3) - 5.9).toFixed(2)),
    upper_bound: Number(((currentBranch?.predicted_cutoff || 90.3) + 5.9).toFixed(2)),
    seat_section: 'State Level'
  };

  const reach = calculateReachability(profile.percentile, catData.predicted_cutoff);
  const isAdded = currentCollege && currentBranch ? isInPreferences(currentCollege.college_code, currentBranch.branch_code) : false;

  // Prepare Recharts trend data
  const chartData = currentBranch?.trend.map(pt => ({
    label: `${pt.year} ${pt.round}`,
    actual: pt.isForecast ? null : pt.cutoff,
    forecast: pt.isForecast ? pt.cutoff : null,
    lower: pt.isForecast ? catData.lower_bound : null,
    upper: pt.isForecast ? catData.upper_bound : null
  })) || [];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Cutoff Intelligence
            </span>
            <span className="text-slate-300">•</span>
            <DataFreshnessIndicator />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Machine Learning Cutoff Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Structural transition projections from historical closing rounds to CAP1 with uncertainty boundaries.
          </p>
        </div>
      </div>

      {/* 2. Selectors Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* College Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Engineering College
            </label>
            <select
              value={selectedCollegeCode}
              onChange={e => {
                const code = Number(e.target.value);
                setSelectedCollegeCode(code);
                const col = colleges.find(c => c.college_code === code);
                if (col && col.branches.length > 0) {
                  setSelectedBranchName(col.branches[0].branch_name);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-brand-500 font-medium truncate"
            >
              {colleges.map(c => (
                <option key={c.college_code} value={c.college_code}>
                  {c.college_code} - {c.college_name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Branch / Course
            </label>
            <select
              value={selectedBranchName}
              onChange={e => setSelectedBranchName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-brand-500 font-medium truncate"
            >
              {currentCollege?.branches.map(b => (
                <option key={b.branch_code} value={b.branch_name}>
                  {b.branch_name} ({b.intake} seats)
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reservation Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-brand-300 bg-brand-50/20 text-brand-900 font-semibold focus:border-brand-500"
            >
              <option value="GOPENS">GOPENS (General Open State)</option>
              <option value="GOBCS">GOBCS (General OBC State)</option>
              <option value="GSCS">GSCS (Scheduled Caste State)</option>
              <option value="GSTS">GSTS (Scheduled Tribe State)</option>
              <option value="EWS">EWS (Economically Weaker)</option>
              <option value="TFWS">TFWS (Fee Waiver Scheme)</option>
              <option value="AI">AI (All India Merit)</option>
              <option value="LOPENS">LOPENS (Ladies Open)</option>
              <option value="LOBCS">LOBCS (Ladies OBC)</option>
            </select>
          </div>

          {/* Target Round */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target CAP Round
            </label>
            <select
              value={targetRound}
              onChange={e => setTargetRound(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-brand-500 font-medium"
            >
              <option value="CAP1">CAP Round 1 (Opening Allocation)</option>
              <option value="CAP2" disabled>CAP Round 2 (Post-CAP1 Release)</option>
              <option value="CAP3" disabled>CAP Round 3 (Post-CAP2 Release)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Forecast Highlight Card */}
      {currentCollege && currentBranch && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
                <span className="font-mono">Institute #{currentCollege.college_code}</span>
                <span>•</span>
                <span>{currentCollege.district}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium">{currentCollege.institute_type}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {currentCollege.college_name}
              </h2>
              <p className="text-sm font-semibold text-brand-600 mt-0.5">
                {currentBranch.branch_name} • Quota: {selectedCategory} ({catData.seat_section || 'State Level'})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ReachabilityBadge level={reach.level} diff={reach.diff} showDiff size="lg" />
              <button
                onClick={() => addPreference(currentCollege, currentBranch, selectedCategory)}
                disabled={isAdded}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isAdded
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>In Preference List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Preference List</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">2025 Closing Cutoff</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {catData.previous_cutoff.toFixed(2)} %ile
              </p>
              <span className="text-[11px] text-slate-400">Actual Final Round Allotment</span>
            </div>

            <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-200">
              <span className="text-xs text-brand-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2026 CAP1 Model Forecast</span>
              </span>
              <p className="text-2xl font-black text-brand-700 mt-1">
                {catData.predicted_cutoff.toFixed(2)} %ile
              </p>
              <span className="text-[11px] text-slate-500">
                Confidence Band: [{catData.lower_bound} - {catData.upper_bound}]
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Your Comparison Buffer</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {reach.diff >= 0 ? `+${reach.diff}` : reach.diff} %ile
              </p>
              <span className="text-[11px] text-slate-500">Student: {profile.percentile?.toFixed(2)} %ile</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Branch Intake</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{currentBranch.intake} Seats</p>
              <span className="text-[11px] text-emerald-600 font-medium">Official Approved Sanction</span>
            </div>
          </div>

          {/* 4. Historical Trend Recharts Visualization */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span>Multi-Year CAP Cutoff Trajectory &amp; 2026 Forecast</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Solid: Historical Rounds • Dashed: 2026 Forecast
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                  <YAxis domain={['auto', 100]} stroke="#64748B" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={profile.percentile}
                    label={{ value: `Your Score (${profile.percentile}%)`, fill: '#2563EB', fontSize: 11 }}
                    stroke="#2563EB"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Observed Cutoff"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0F172A' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="2026 CAP1 Forecast"
                    stroke="#2563EB"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 5. Model Architecture & Metrics Transparency Panel */}
      {modelMetrics && <ModelMetricsPanel metrics={modelMetrics} />}
    </div>
  );
};
