import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  Building2,
  Sparkles,
  Plus,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  fetchPredictorData,
  PredictorDataPayload
} from '../../services/predictorService';
import { usePreferences } from '../../context/PreferenceContext';

const TOP_BRANCHES = [
  'Computer Engineering',
  'Computer Science and Engineering',
  'Artificial Intelligence and Data Science',
  'Information Technology',
  'Electronics and Telecommunication Engg',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Robotics and Automation'
];

export const TopColleges: React.FC = () => {
  const [dataPayload, setDataPayload] = useState<PredictorDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('Computer Engineering');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedQuota, setSelectedQuota] = useState('GOPENS');
  const [searchTerm, setSearchTerm] = useState('');

  const { addPreference, isInPreferences } = usePreferences();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictorData().then(data => {
      setDataPayload(data);
      setLoading(false);
    });
  }, []);

  const rankedColleges = useMemo(() => {
    if (!dataPayload) return [];
    const rows = dataPayload.rows_2026;

    const list: Array<{
      college_code: number;
      college_name: string;
      district: string;
      university: string;
      is_autonomous: boolean;
      branch_name: string;
      quota: string;
      avg_p: number;
      r1_p: number | null;
      r4_p: number | null;
    }> = [];

    const seenColleges = new Set<number>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.b.toLowerCase() !== selectedBranch.toLowerCase()) continue;
      if (r.q !== selectedQuota && selectedQuota !== 'All') continue;

      const col = dataPayload.colleges[r.c];
      if (!col) continue;

      if (selectedDistrict !== 'All' && col.dist !== selectedDistrict) continue;

      if (searchTerm) {
        const text = `${col.name} ${col.dist} ${col.uni}`.toLowerCase();
        if (!text.includes(searchTerm.toLowerCase())) continue;
      }

      if (seenColleges.has(col.code)) continue;
      seenColleges.add(col.code);

      list.push({
        college_code: col.code,
        college_name: col.name,
        district: col.dist,
        university: col.uni,
        is_autonomous: col.auto,
        branch_name: r.b,
        quota: r.q,
        avg_p: r.p[4] || 0,
        r1_p: r.p[0],
        r4_p: r.p[3]
      });
    }

    // Sort descending by highest cutoff (most sought-after colleges rank #1)
    list.sort((a, b) => b.avg_p - a.avg_p);
    return list;
  }, [dataPayload, selectedBranch, selectedDistrict, selectedQuota, searchTerm]);

  const handleAddChoice = (item: any) => {
    const branchCode = item.college_code * 1000 + 10;
    const branchObj = {
      branch_code: branchCode,
      branch_name: item.branch_name,
      predicted_cutoff: item.avg_p,
      previous_cutoff: item.r4_p || item.avg_p,
      intake: 60,
      category_cutoffs: {
        [item.quota]: {
          previous_cutoff: item.r4_p || item.avg_p,
          predicted_cutoff: item.avg_p,
          lower_bound: Number((item.avg_p - 1.5).toFixed(2)),
          upper_bound: Number((item.avg_p + 1.5).toFixed(2)),
          seat_section: item.is_autonomous ? 'Autonomous' : 'State Level'
        }
      },
      trend: []
    };

    const collegeObj = {
      college_code: item.college_code,
      college_name: item.college_name,
      district: item.district,
      institute_type: item.is_autonomous ? 'Autonomous' : 'Government/Aided',
      branches_count: 1,
      branches: [branchObj]
    };

    addPreference(collegeObj, branchObj, item.quota);
    setAddedId(String(item.college_code));
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 mb-3 uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-purple-300" />
          Branch-Wise Quality Rankings
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
          Top Engineering Colleges in Maharashtra
        </h1>
        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
          Colleges ranked by official CAP closing cutoffs and student admission demand for your chosen
          branch. Find the most sought-after institutes in Maharashtra.
        </p>
      </div>

      {/* Branch Selector Pills */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Engineering Branch:
          </span>
          <span className="text-xs font-bold text-brand-600">
            {rankedColleges.length} Institutes offering {selectedBranch}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TOP_BRANCHES.map(br => (
            <button
              key={br}
              type="button"
              onClick={() => setSelectedBranch(br)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBranch === br
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {br}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked Colleges List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-semibold">
            Analyzing closing percentiles & rankings...
          </div>
        ) : rankedColleges.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            No colleges found for this branch with selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rankedColleges.map((col, idx) => {
              const inPref = isInPreferences(col.college_code, col.college_code * 1000 + 10);
              const rank = idx + 1;

              return (
                <div
                  key={col.college_code}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-900'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {col.college_name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          #{col.college_code}
                        </span>
                        {col.is_autonomous && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Autonomous
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{col.district}</span>
                        <span>•</span>
                        <span>{col.university}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600 font-semibold">
                          Quota: {col.quota}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cutoff & Add */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                        Cutoff
                      </div>
                      <div className="text-base font-mono font-black text-purple-700">
                        {col.avg_p.toFixed(3)} %ile
                      </div>
                    </div>

                    {inPref ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <Check className="w-4 h-4" /> Added
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddChoice(col)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-700 hover:text-white transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Choice</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
