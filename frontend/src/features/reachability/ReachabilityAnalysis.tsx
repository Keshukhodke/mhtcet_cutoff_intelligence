import React, { useState, useEffect, useMemo } from 'react';
import { Target, Info, ShieldCheck, AlertTriangle, ArrowRight, Compass, Plus, Check } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import { api, calculateReachability } from '../../services/api';
import { College, Branch, ReachabilityLevel } from '../../types';
import { ReachabilityBadge } from '../../components/common/ReachabilityBadge';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';

export const ReachabilityAnalysis: React.FC = () => {
  const { profile } = useStudent();
  const { addPreference, isInPreferences } = usePreferences();

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  useEffect(() => {
    api.getColleges().then(data => {
      setColleges(data);
      setLoading(false);
    });
  }, []);

  const categorizedItems = useMemo(() => {
    const list: Array<{
      college: College;
      branch: Branch;
      predicted_cutoff: number;
      previous_cutoff: number;
      reachability: ReachabilityLevel;
      diff: number;
      explanation: string;
    }> = [];

    colleges.forEach(col => {
      col.branches.forEach(br => {
        const cat = profile.category || 'GOPENS';
        const catData = br.category_cutoffs[cat] || {
          previous_cutoff: br.previous_cutoff,
          predicted_cutoff: br.predicted_cutoff
        };

        const reach = calculateReachability(profile.percentile, catData.predicted_cutoff);

        list.push({
          college: col,
          branch: br,
          predicted_cutoff: catData.predicted_cutoff,
          previous_cutoff: catData.previous_cutoff,
          reachability: reach.level,
          diff: reach.diff,
          explanation: reach.explanation
        });
      });
    });

    return list;
  }, [colleges, profile.percentile, profile.category]);

  const filtered = useMemo(() => {
    return categorizedItems.filter(item => {
      if (selectedTier !== 'All' && item.reachability !== selectedTier) return false;
      if (selectedDistrict !== 'All' && item.college.district !== selectedDistrict) return false;
      return true;
    }).sort((a, b) => b.predicted_cutoff - a.predicted_cutoff);
  }, [categorizedItems, selectedTier, selectedDistrict]);

  const tierCounts = {
    Reachable: categorizedItems.filter(i => i.reachability === 'Reachable').length,
    Borderline: categorizedItems.filter(i => i.reachability === 'Borderline').length,
    Ambitious: categorizedItems.filter(i => i.reachability === 'Ambitious').length,
    VeryLow: categorizedItems.filter(i => i.reachability === 'Very Low').length
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Admission Feasibility
            </span>
            <span className="text-slate-300">•</span>
            <DataFreshnessIndicator />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explainable Reachability Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparing your score (<strong className="text-slate-800">{profile.percentile?.toFixed(2)} %ile</strong>, Category: <strong className="text-slate-800">{profile.category}</strong>) against 2026 forecasted cutoffs.
          </p>
        </div>
      </div>

      {/* 2. Tier Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedTier(selectedTier === 'Reachable' ? 'All' : 'Reachable')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-card ${
            selectedTier === 'Reachable' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-emerald-700">Reachable (Safe)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tierCounts.Reachable}</p>
          <span className="text-[11px] text-slate-500 block mt-1">Score is +1.5% higher</span>
        </div>

        <div
          onClick={() => setSelectedTier(selectedTier === 'Borderline' ? 'All' : 'Borderline')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-card ${
            selectedTier === 'Borderline' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-amber-700">Borderline (Target)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tierCounts.Borderline}</p>
          <span className="text-[11px] text-slate-500 block mt-1">Within ±2.0% buffer</span>
        </div>

        <div
          onClick={() => setSelectedTier(selectedTier === 'Ambitious' ? 'All' : 'Ambitious')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-card ${
            selectedTier === 'Ambitious' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-rose-700">Ambitious (Dream)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tierCounts.Ambitious}</p>
          <span className="text-[11px] text-slate-500 block mt-1">2.0% to 6.0% reach</span>
        </div>

        <div
          onClick={() => setSelectedTier(selectedTier === 'Very Low' ? 'All' : 'Very Low')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-card ${
            selectedTier === 'Very Low' ? 'border-slate-500 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-600">Very Low Feasibility</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tierCounts.VeryLow}</p>
          <span className="text-[11px] text-slate-500 block mt-1">&gt; 6% below cutoff</span>
        </div>
      </div>

      {/* 3. Filter Controls & Clear Disclosures */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Filter Location:</span>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="All">All Maharashtra Regions</option>
            <option value="Pune">Pune District</option>
            <option value="Mumbai">Mumbai / MMR</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Nashik">Nashik</option>
            <option value="Chhatrapati Sambhajinagar">Chh. Sambhajinagar</option>
          </select>

          {selectedTier !== 'All' && (
            <button
              onClick={() => setSelectedTier('All')}
              className="text-brand-600 font-semibold underline"
            >
              Show All Tiers
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Showing <strong>{filtered.length}</strong> college options</span>
        </div>
      </div>

      {/* 4. Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading reachability data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No colleges match the selected reachability tier and district filters.
          </div>
        ) : (
          filtered.slice(0, 50).map(item => {
            const isAdded = isInPreferences(item.college.college_code, item.branch.branch_code);

            return (
              <div
                key={`${item.college.college_code}-${item.branch.branch_code}`}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <ReachabilityBadge level={item.reachability} diff={item.diff} showDiff size="sm" />
                    <span className="text-slate-400 text-xs font-mono">#{item.college.college_code}</span>
                    <span className="text-slate-500 text-xs">• {item.college.district}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {item.college.college_name}
                  </h3>
                  <p className="text-xs font-semibold text-brand-700">
                    {item.branch.branch_name}
                  </p>

                  <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 gap-2">
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">2026 Forecast</span>
                    <span className="text-base font-bold text-slate-900">{item.predicted_cutoff.toFixed(2)} %ile</span>
                  </div>

                  <button
                    onClick={() => addPreference(item.college, item.branch)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isAdded
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In List</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Choice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Clear Methodology & Limitations Disclaimer */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Reachability Methodology &amp; Limitations Notice</span>
        </div>
        <p className="leading-relaxed">
          Reachability labels are calculated via rule-based comparison between your MHT-CET score and the model's calibrated CAP Round 1 cutoff forecast.
          These indicators are decision-support heuristics designed to assist in option balancing; they do not represent mathematically guaranteed admission probabilities or guarantee college seat allotment.
        </p>
      </div>
    </div>
  );
};
