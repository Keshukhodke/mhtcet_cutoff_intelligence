import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Plus,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import { api, calculateReachability } from '../../services/api';
import { College, Branch } from '../../types';
import { ReachabilityBadge } from '../../components/common/ReachabilityBadge';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';

interface FlatCollegeResult {
  college: College;
  branch: Branch;
  predicted_cutoff: number;
  previous_cutoff: number;
  lower_bound: number;
  upper_bound: number;
  intake: number;
  reachability: 'Reachable' | 'Borderline' | 'Ambitious' | 'Very Low';
  diff: number;
}

export const CollegeExplorer: React.FC = () => {
  const { profile } = useStudent();
  const { addPreference, isInPreferences } = usePreferences();

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>(profile.category || 'GOPENS');
  const [selectedReachability, setSelectedReachability] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'cutoff_desc' | 'cutoff_asc' | 'diff_asc' | 'name'>('cutoff_desc');

  // Compare Drawer State
  const [compareList, setCompareList] = useState<FlatCollegeResult[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    api.getColleges().then(data => {
      setColleges(data);
      setLoading(false);
    });
  }, []);

  // Flatten colleges and branches according to selected category
  const flatResults = useMemo(() => {
    const list: FlatCollegeResult[] = [];

    colleges.forEach(col => {
      col.branches.forEach(br => {
        const catData = br.category_cutoffs[selectedCategory] || {
          previous_cutoff: br.previous_cutoff,
          predicted_cutoff: br.predicted_cutoff,
          lower_bound: Number((br.predicted_cutoff - 5.9).toFixed(2)),
          upper_bound: Number((br.predicted_cutoff + 5.9).toFixed(2))
        };

        const reach = calculateReachability(profile.percentile, catData.predicted_cutoff);

        list.push({
          college: col,
          branch: br,
          predicted_cutoff: catData.predicted_cutoff,
          previous_cutoff: catData.previous_cutoff,
          lower_bound: catData.lower_bound,
          upper_bound: catData.upper_bound,
          intake: br.intake,
          reachability: reach.level,
          diff: reach.diff
        });
      });
    });

    return list;
  }, [colleges, selectedCategory, profile.percentile]);

  // Apply search & filters
  const filteredResults = useMemo(() => {
    return flatResults.filter(item => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.college.college_name.toLowerCase().includes(q);
        const matchCode = String(item.college.college_code).includes(q);
        const matchBranch = item.branch.branch_name.toLowerCase().includes(q);
        const matchDistrict = item.college.district.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBranch && !matchDistrict) return false;
      }

      // District
      if (selectedDistrict !== 'All' && item.college.district !== selectedDistrict) return false;

      // Branch
      if (selectedBranch !== 'All' && item.branch.branch_name !== selectedBranch) return false;

      // Institute type
      if (selectedType !== 'All' && item.college.institute_type !== selectedType) return false;

      // Reachability
      if (selectedReachability !== 'All' && item.reachability !== selectedReachability) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'cutoff_desc') return b.predicted_cutoff - a.predicted_cutoff;
      if (sortBy === 'cutoff_asc') return a.predicted_cutoff - b.predicted_cutoff;
      if (sortBy === 'diff_asc') return Math.abs(a.diff) - Math.abs(b.diff);
      return a.college.college_name.localeCompare(b.college.college_name);
    });
  }, [flatResults, searchQuery, selectedDistrict, selectedBranch, selectedType, selectedReachability, sortBy]);

  const toggleCompare = (item: FlatCollegeResult) => {
    setCompareList(prev => {
      const exists = prev.some(
        c => c.college.college_code === item.college.college_code && c.branch.branch_code === item.branch.branch_code
      );
      if (exists) {
        return prev.filter(
          c => !(c.college.college_code === item.college.college_code && c.branch.branch_code === item.branch.branch_code)
        );
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 colleges simultaneously.');
        return prev;
      }
      return [...prev, item];
    });
  };

  const isCompared = (item: FlatCollegeResult) => {
    return compareList.some(
      c => c.college.college_code === item.college.college_code && c.branch.branch_code === item.branch.branch_code
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('All');
    setSelectedBranch('All');
    setSelectedCategory(profile.category || 'GOPENS');
    setSelectedReachability('All');
    setSelectedType('All');
    setSortBy('cutoff_desc');
  };

  const activeFiltersCount = [
    selectedDistrict !== 'All',
    selectedBranch !== 'All',
    selectedReachability !== 'All',
    selectedType !== 'All',
    Boolean(searchQuery.trim())
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Freshness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Admission Explorer
            </span>
            <span className="text-slate-300">•</span>
            <DataFreshnessIndicator />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Maharashtra College &amp; Cutoff Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search 362 engineering institutes and compare 2026 ML predicted cutoffs against your{' '}
            <strong className="text-slate-700">{profile.percentile?.toFixed(2)} %ile</strong> profile.
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Layers className="w-4 h-4" />
            <span>Compare Selected ({compareList.length})</span>
          </button>
        )}
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by college name, code (e.g. 6006), branch, or city..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-brand-500"
            >
              <option value="All">All Districts / Hubs</option>
              <option value="Pune">Pune District</option>
              <option value="Mumbai">Mumbai / MMR</option>
              <option value="Nagpur">Nagpur District</option>
              <option value="Nashik">Nashik Region</option>
              <option value="Chhatrapati Sambhajinagar">Chh. Sambhajinagar</option>
              <option value="Amravati">Amravati Region</option>
              <option value="Kolhapur/Sangli">Kolhapur / Sangli</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
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
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Engineering Branches</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Artificial Intelligence and Data Science">AI &amp; Data Science</option>
              <option value="Computer Science and Engineering">Computer Science &amp; Engg</option>
              <option value="Electronics and Telecommunication Engg">ENTC Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
            </select>

            {/* Reachability Filter */}
            <select
              value={selectedReachability}
              onChange={e => setSelectedReachability(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Reachability Tiers</option>
              <option value="Reachable">🟢 Reachable (Safe)</option>
              <option value="Borderline">🟡 Borderline (Realistic)</option>
              <option value="Ambitious">🔴 Ambitious (Dream)</option>
              <option value="Very Low">⚪ Very Low Probability</option>
            </select>

            {/* Institute Type */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Institute Types</option>
              <option value="Government Autonomous">Government Autonomous</option>
              <option value="Government">Government</option>
              <option value="Govt Aided">Govt Aided</option>
              <option value="Private Autonomous">Private Autonomous</option>
              <option value="Private / Un-Aided">Private / Un-Aided</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="cutoff_desc">Predicted Cutoff: High to Low</option>
              <option value="cutoff_asc">Predicted Cutoff: Low to High</option>
              <option value="diff_asc">Closest to My Percentile</option>
              <option value="name">Institute Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Results Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            Showing <strong>{filteredResults.length}</strong> matching college options (Category:{' '}
            <strong className="text-slate-700">{selectedCategory}</strong>)
          </span>
          <span className="hidden sm:inline">
            Comparing against student score: <strong>{profile.percentile?.toFixed(2)} %ile</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading validated colleges and prediction records...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">No colleges match your active filters</p>
            <p className="text-slate-500 mt-1">Try widening your district or branch choices, or click Reset Filters.</p>
            <button
              onClick={resetFilters}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Cmp</th>
                    <th className="py-3 px-4">Institute &amp; Code</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3 text-right">2025 Closing</th>
                    <th className="py-3 px-4 text-right">2026 Forecast</th>
                    <th className="py-3 px-3 text-center">Intake</th>
                    <th className="py-3 px-4">Reachability</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.slice(0, 100).map(item => {
                    const isAdded = isInPreferences(item.college.college_code, item.branch.branch_code);
                    const compared = isCompared(item);

                    return (
                      <tr
                        key={`${item.college.college_code}-${item.branch.branch_code}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={compared}
                            onChange={() => toggleCompare(item)}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            title="Compare college"
                          />
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {item.college.college_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">#{item.college.college_code}</span>
                            <span>•</span>
                            <span className="text-slate-500">{item.college.institute_type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{item.branch.branch_name}</span>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            Code: {item.branch.branch_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {item.college.district}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-500">
                          {item.previous_cutoff.toFixed(2)} %ile
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-slate-900 text-sm">
                            {item.predicted_cutoff.toFixed(2)} %ile
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            [{item.lower_bound} - {item.upper_bound}]
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-mono">
                          {item.intake}
                        </td>
                        <td className="py-3 px-4">
                          <ReachabilityBadge
                            level={item.reachability}
                            diff={item.diff}
                            showDiff
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => addPreference(item.college, item.branch, selectedCategory)}
                            disabled={isAdded}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              isAdded
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white border border-brand-200'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add Choice</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredResults.slice(0, 50).map(item => {
                const isAdded = isInPreferences(item.college.college_code, item.branch.branch_code);
                return (
                  <div key={`${item.college.college_code}-${item.branch.branch_code}`} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">
                          {item.college.college_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.branch.branch_name} • {item.college.district}
                        </p>
                      </div>
                      <ReachabilityBadge level={item.reachability} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[11px]">2025 Closing:</span>
                        <p className="font-medium text-slate-700">{item.previous_cutoff.toFixed(2)} %ile</p>
                      </div>
                      <div>
                        <span className="text-brand-600 font-semibold text-[11px]">2026 Forecast:</span>
                        <p className="font-bold text-slate-900">{item.predicted_cutoff.toFixed(2)} %ile</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Intake: {item.intake} seats • Code: {item.college.college_code}
                      </span>
                      <button
                        onClick={() => addPreference(item.college, item.branch, selectedCategory)}
                        disabled={isAdded}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          isAdded
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                      >
                        {isAdded ? 'Added' : '+ Add Preference'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Comparison Drawer / Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Side-by-Side College Cutoff Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing {compareList.length} colleges for category: <strong>{selectedCategory}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {compareList.map(item => (
                <div key={`${item.college.college_code}-${item.branch.branch_code}`} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[11px] font-mono text-slate-400">#{item.college.college_code}</span>
                      <button
                        onClick={() => toggleCompare(item)}
                        className="text-slate-400 hover:text-rose-600 text-xs"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-tight mb-1">
                      {item.college.college_name}
                    </h4>
                    <p className="text-xs text-brand-700 font-medium mb-3">
                      {item.branch.branch_name}
                    </p>

                    <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-medium text-slate-800">{item.college.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-medium text-slate-800 text-[11px] truncate max-w-[100px]">{item.college.institute_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">2025 Closing:</span>
                        <span className="font-medium text-slate-800">{item.previous_cutoff.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-600 font-semibold">2026 Forecast:</span>
                        <span className="font-bold text-slate-900">{item.predicted_cutoff.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Intake:</span>
                        <span className="font-mono text-slate-800">{item.intake} seats</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <ReachabilityBadge level={item.reachability} diff={item.diff} showDiff size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setCompareList([])}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Clear Comparison
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
