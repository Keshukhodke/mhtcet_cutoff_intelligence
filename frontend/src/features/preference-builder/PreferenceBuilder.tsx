import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Printer,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  Check,
  Building2,
  Award,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { usePreferences } from '../../context/PreferenceContext';
import { useStudent } from '../../context/StudentContext';
import { ReachabilityBadge } from '../../components/common/ReachabilityBadge';
import {
  fetchPredictorData,
  predictColleges,
  PredictorDataPayload,
  PredictedItem
} from '../../services/predictorService';

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Mumbai Suburban', 'Mumbai City', 'Thane', 'Nashik', 'Nagpur',
  'Ahilyanagar', 'Kolhapur', 'Chhatrapati Sambhajinagar', 'Amravati', 'Sangli',
  'Solapur', 'Jalgaon', 'Satara', 'Raigad', 'Nanded', 'Latur', 'Dhule',
  'Palghar', 'Akola', 'Yavatmal', 'Buldhana', 'Beed', 'Jalna', 'Dharashiv',
  'Parbhani', 'Wardha', 'Chandrapur', 'Ratnagiri', 'Sindhudurg', 'Bhandara',
  'Gondia', 'Gadchiroli', 'Washim', 'Hingoli', 'Nandurbar'
];

const TARGET_BRANCHES = [
  'Computer Engineering',
  'Computer Science and Engineering',
  'Artificial Intelligence and Data Science',
  'Information Technology',
  'Electronics and Telecommunication Engg',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Robotics and Automation',
  'Data Science'
];

export const PreferenceBuilder: React.FC = () => {
  const { preferences, removePreference, moveUp, moveDown, clearPreferences, addPreference } = usePreferences();
  const { profile, updateProfile } = useStudent();

  // Generator & Data States
  const [dataPayload, setDataPayload] = useState<PredictorDataPayload | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-list' | 'auto-generator'>('my-list');

  // Generator Controls (EduVale Web Options Generator Reference)
  const [examType, setExamType] = useState<'MHT-CET' | 'JEE-Main'>('MHT-CET');
  const [predictBy, setPredictBy] = useState<'percentile' | 'rank'>('percentile');
  const [scoreInput, setScoreInput] = useState<string>(
    profile.percentile ? String(profile.percentile) : '92.50'
  );
  const [category, setCategory] = useState<string>(profile.category || 'OPEN');
  const [district, setDistrict] = useState<string>(profile.homeUniversity?.includes('Pune') ? 'Pune' : 'Pune');
  const [gender, setGender] = useState<'Male' | 'Female'>(profile.gender === 'Female' ? 'Female' : 'Male');
  const [isEWS, setIsEWS] = useState<boolean>(profile.isEWS || false);
  const [isTFWS, setIsTFWS] = useState<boolean>(profile.isTFWS || false);
  const [isPWD, setIsPWD] = useState<boolean>(profile.specialQuota === 'PWD');
  const [isDEF, setIsDEF] = useState<boolean>(profile.specialQuota === 'DEF');
  const [isOrphan, setIsOrphan] = useState<boolean>(profile.specialQuota === 'ORPHAN');

  // Target Filters
  const [targetDistricts, setTargetDistricts] = useState<string[]>(['Pune', 'Mumbai Suburban', 'Thane']);
  const [targetBranches, setTargetBranches] = useState<string[]>([
    'Computer Engineering',
    'Artificial Intelligence and Data Science',
    'Information Technology'
  ]);
  const [distSearch, setDistSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  // Auto-generation success feedback
  const [genCount, setGenCount] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Reachable' | 'Borderline' | 'Ambitious'>('All');

  // Fetch predictor dataset on mount
  useEffect(() => {
    setIsLoadingData(true);
    fetchPredictorData()
      .then(d => {
        setDataPayload(d);
        setIsLoadingData(false);
      })
      .catch(() => setIsLoadingData(false));
  }, []);

  // Filter existing user preferences
  const filteredPreferences = preferences.filter(item => {
    if (activeFilter !== 'All' && item.reachability !== activeFilter) return false;
    return true;
  });

  // Calculate tier distribution counts
  const counts = {
    reachable: preferences.filter(p => p.reachability === 'Reachable').length,
    borderline: preferences.filter(p => p.reachability === 'Borderline').length,
    ambitious: preferences.filter(p => p.reachability === 'Ambitious').length
  };

  // Toggle district selection
  const toggleDistrict = (d: string) => {
    if (targetDistricts.includes(d)) {
      setTargetDistricts(targetDistricts.filter(x => x !== d));
    } else {
      setTargetDistricts([...targetDistricts, d]);
    }
  };

  // Toggle branch selection
  const toggleBranch = (b: string) => {
    if (targetBranches.includes(b)) {
      setTargetBranches(targetBranches.filter(x => x !== b));
    } else {
      setTargetBranches([...targetBranches, b]);
    }
  };

  // Generate Web Options Strategy (EduVale Strategy: Mix of Dream, Target, and Safe)
  const handleAutoGenerateOptions = () => {
    if (!dataPayload) return;

    const numScore = parseFloat(scoreInput) || 0;
    if (numScore <= 0) return;

    // Run prediction engine with the user's constraints
    const matched = predictColleges(dataPayload, {
      examType,
      predictBy,
      score: numScore,
      category,
      district,
      gender,
      isEWS,
      isTFWS,
      isPWD,
      isDEF,
      isOrphan,
      includeMinority: false,
      selectedBranches: targetBranches.length > 0 ? targetBranches : [],
      year: '2026'
    });

    // Filter by target districts if selected
    const inDistricts =
      targetDistricts.length > 0
        ? matched.filter(m => targetDistricts.includes(m.district))
        : matched;

    // Pick a strategically balanced portfolio of:
    // - Up to 5 Dream choices (Ambitious)
    // - Up to 10 Realistic choices (Borderline)
    // - Up to 10 Safe choices (Reachable)
    const dreams = inDistricts.filter(m => m.safety === 'Dream').slice(0, 5);
    const realistic = inDistricts.filter(m => m.safety === 'Realistic').slice(0, 10);
    const safe = inDistricts.filter(m => m.safety === 'Safe').slice(0, 10);

    const strategicList = [...dreams, ...realistic, ...safe];

    // Clear previous and load new strategic list
    clearPreferences();

    strategicList.forEach(item => {
      const branchCode = item.college_code * 1000 + 10;
      const branchObj = {
        branch_code: branchCode,
        branch_name: item.branch_name,
        predicted_cutoff: item.avg_percentile,
        previous_cutoff: item.r4_percentile || item.avg_percentile,
        intake: 60,
        category_cutoffs: {
          [item.quota]: {
            previous_cutoff: item.r4_percentile || item.avg_percentile,
            predicted_cutoff: item.avg_percentile,
            lower_bound: Number((item.avg_percentile - 1.5).toFixed(2)),
            upper_bound: Number((item.avg_percentile + 1.5).toFixed(2)),
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
    });

    setGenCount(strategicList.length);
    setActiveTab('my-list');

    // Also silently sync student profile
    updateProfile({
      percentile: predictBy === 'percentile' ? numScore : profile.percentile,
      rank: predictBy === 'rank' ? Math.round(numScore) : profile.rank,
      category,
      gender,
      isEWS,
      isTFWS,
      preferredBranches: targetBranches,
      preferredDistricts: targetDistricts
    });
  };

  // Export CSV
  const exportCSV = () => {
    if (preferences.length === 0) return;

    const headers = [
      'Option_Number',
      'Institute_Code',
      'College_Name',
      'Branch_Name',
      'District',
      'Quota_Category',
      'Cutoff_Percentile',
      'Feasibility_Tier'
    ];
    const rows = preferences.map(p => [
      p.preferenceNumber,
      p.college_code,
      `"${p.college_name.replace(/"/g, '""')}"`,
      `"${p.branch_name.replace(/"/g, '""')}"`,
      `"${p.district}"`,
      p.category,
      p.predicted_cutoff.toFixed(3),
      p.reachability
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maharashtra_CAP_Preference_List_${profile.examYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 mb-3 shadow-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            CAP 2026 Web Options Generator
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            CAP Preference List Builder & Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Build, organize and auto-generate your college-branch option entry order for Maharashtra
            CAP rounds. Strategically organized into Dream, Realistic and Safe choices.
          </p>
        </div>
      </div>

      {/* 2. Mode Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('my-list')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'my-list'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>My Preference Order</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'my-list' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {preferences.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auto-generator')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'auto-generator'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Auto-Generate Strategic Options</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
            EduVale Logic
          </span>
        </button>
      </div>

      {/* TAB 1: MY PREFERENCE ORDER */}
      {activeTab === 'my-list' && (
        <div className="space-y-6">
          {/* List Controls & Strategy Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Strategic Balance:
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🟢 Safe: <strong>{counts.reachable}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  🟡 Realistic: <strong>{counts.borderline}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  🟣 Dream: <strong>{counts.ambitious}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCSV}
                disabled={preferences.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={preferences.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              {preferences.length > 0 && (
                <button
                  type="button"
                  onClick={clearPreferences}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner if newly generated */}
          {genCount !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                Successfully auto-generated {genCount} strategic preference choices matching your
                score and target branches!
              </span>
              <button
                type="button"
                onClick={() => setGenCount(null)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Options List */}
          {preferences.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
                <ListOrdered className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Your Preference List is Empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You can auto-generate a strategically balanced preference list tailored to your score,
                or browse colleges and add choices manually.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('auto-generator')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Generate With My Score</span>
                </button>
                <Link
                  to="/predictor"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span>Open College Predictor</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPreferences.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all group"
                >
                  {/* Left: Priority Badge & College Details */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {p.preferenceNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{p.college_name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          #{p.college_code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.category}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-600 mt-0.5">
                        {p.branch_name}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{p.district}</span>
                        <span>•</span>
                        <span>
                          Cutoff: <strong>{p.predicted_cutoff.toFixed(3)}%ile</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Feasibility Badge & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <ReachabilityBadge level={p.reachability} />

                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveUp(idx)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
                        title="Move Up in Priority"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === preferences.length - 1}
                        onClick={() => moveDown(idx)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors"
                        title="Move Down in Priority"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePreference(p.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                        title="Remove Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEB OPTIONS AUTO-GENERATOR (EduVale Specification) */}
      {activeTab === 'auto-generator' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              STRATEGIC OPTION GENERATOR
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Configure Your Score, Target Districts & Branches
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Our algorithm analyzes 4 CAP rounds of cutoffs to structure a safe, multi-tiered preference list.
            </p>
          </div>

          {/* Exam Type & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={e => setExamType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
              >
                <option value="MHT-CET">MHT-CET (State CAP)</option>
                <option value="JEE-Main">JEE Main (All India / AI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Predict By
              </label>
              <select
                value={predictBy}
                onChange={e => setPredictBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
              >
                <option value="percentile">Percentile Score</option>
                <option value="rank">State General Merit Rank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {predictBy === 'percentile' ? 'Percentile (0–100)' : 'State Merit Rank'}
              </label>
              <input
                type="number"
                step={predictBy === 'percentile' ? '0.01' : '1'}
                value={scoreInput}
                onChange={e => setScoreInput(e.target.value)}
                placeholder="e.g. 92.50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          {/* Category & Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Caste Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
              >
                <option value="OPEN">OPEN / General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="VJ/DT">VJ / DT-A</option>
                <option value="NT-B">NT-B</option>
                <option value="NT-C">NT-C</option>
                <option value="NT-D">NT-D</option>
                <option value="SEBC">SEBC / Maratha</option>
                <option value="SBC">SBC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                12th District (For HU/OU)
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
              >
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female (L Quota)</option>
              </select>
            </div>
          </div>

          {/* Quotas Checkbox Row */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEWS}
                onChange={e => setIsEWS(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span>EWS (10% Open Quota)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTFWS}
                onChange={e => setIsTFWS(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span>TFWS (Tuition Fee Waiver)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPWD}
                onChange={e => setIsPWD(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span>PWD / Divyang</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDEF}
                onChange={e => setIsDEF(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span>Defence Ward (DEF)</span>
            </label>
          </div>

          {/* Target Districts & Branches Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Districts */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target Districts ({targetDistricts.length})
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetDistricts([...MAHARASHTRA_DISTRICTS])}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setTargetDistricts([])}
                    className="text-slate-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Search districts..."
                value={distSearch}
                onChange={e => setDistSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
              />

              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {MAHARASHTRA_DISTRICTS.filter(d =>
                  d.toLowerCase().includes(distSearch.toLowerCase())
                ).map(d => {
                  const checked = targetDistricts.includes(d);
                  return (
                    <label
                      key={d}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white text-xs cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDistrict(d)}
                        className="rounded text-brand-600"
                      />
                      <span className={checked ? 'font-bold text-slate-900' : 'text-slate-600'}>
                        {d}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Branches */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target Branches ({targetBranches.length})
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetBranches([...TARGET_BRANCHES])}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setTargetBranches([])}
                    className="text-slate-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Search branches..."
                value={branchSearch}
                onChange={e => setBranchSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-600"
              />

              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {TARGET_BRANCHES.filter(b =>
                  b.toLowerCase().includes(branchSearch.toLowerCase())
                ).map(b => {
                  const checked = targetBranches.includes(b);
                  return (
                    <label
                      key={b}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white text-xs cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBranch(b)}
                        className="rounded text-brand-600"
                      />
                      <span className={checked ? 'font-bold text-slate-900' : 'text-slate-600'}>
                        {b}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Call-to-action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              ⚡ Will generate a multi-tiered option order with Dream, Realistic & Safe choices.
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateOptions}
              disabled={isLoadingData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Web Options List</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
