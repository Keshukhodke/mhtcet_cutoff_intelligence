import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  HelpCircle,
  Plus,
  Compass,
  ArrowUpDown,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { usePreferences } from '../../context/PreferenceContext';
import {
  fetchPredictorData,
  predictColleges,
  computeEligibleQuotas,
  getUniversityForDistrict,
  PredictorDataPayload,
  PredictedItem
} from '../../services/predictorService';

const CASTE_CATEGORIES = [
  { code: 'OPEN', name: 'Open / General', marathi: 'खुला प्रवर्ग', desc: 'All candidates eligible' },
  { code: 'OBC', name: 'Other Backward Class', marathi: 'इतर मागासवर्ग', desc: 'Requires NCL certificate' },
  { code: 'SC', name: 'Scheduled Caste', marathi: 'अनुसूचित जाती', desc: 'State & Central SC list' },
  { code: 'ST', name: 'Scheduled Tribe', marathi: 'अनुसूचित जमाती', desc: 'Scheduled tribal groups' },
  { code: 'VJ/DT', name: 'Vimukta Jati / NT-A', marathi: 'विमुक्त जाती (अ)', desc: 'Denotified tribes' },
  { code: 'NT-B', name: 'Nomadic Tribe B', marathi: 'भटक्या जमाती (ब)', desc: 'NT-B category' },
  { code: 'NT-C', name: 'Nomadic Tribe C', marathi: 'भटक्या जमाती (क)', desc: 'Includes Dhangar' },
  { code: 'NT-D', name: 'Nomadic Tribe D', marathi: 'भटक्या जमाती (ड)', desc: 'NT-D category' },
  { code: 'SEBC', name: 'SEBC / Maratha', marathi: 'मराठा आरक्षण', desc: 'SEBC reservation quota' },
  { code: 'SBC', name: 'Special Backward Class', marathi: 'विशेष मागास प्रवर्ग', desc: 'State SBC category' }
];

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Mumbai Suburban', 'Mumbai City', 'Thane', 'Nashik', 'Nagpur',
  'Ahilyanagar', 'Kolhapur', 'Chhatrapati Sambhajinagar', 'Amravati', 'Sangli',
  'Solapur', 'Jalgaon', 'Satara', 'Raigad', 'Nanded', 'Latur', 'Dhule',
  'Palghar', 'Akola', 'Yavatmal', 'Buldhana', 'Beed', 'Jalna', 'Dharashiv',
  'Parbhani', 'Wardha', 'Chandrapur', 'Ratnagiri', 'Sindhudurg', 'Bhandara',
  'Gondia', 'Gadchiroli', 'Washim', 'Hingoli', 'Nandurbar'
];

const QUICK_BRANCHES = [
  'Computer Engineering',
  'Computer Science and Engineering',
  'Artificial Intelligence and Data Science',
  'Information Technology',
  'Electronics and Telecommunication Engg',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering'
];

export const CollegePredictor: React.FC = () => {
  const { profile, updateProfile } = useStudent();
  const { addPreference, isInPreferences } = usePreferences();

  // Loading state
  const [dataPayload, setDataPayload] = useState<PredictorDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form Controls
  const [examType, setExamType] = useState<'MHT-CET' | 'JEE-Main'>('MHT-CET');
  const [predictBy, setPredictBy] = useState<'percentile' | 'rank'>('percentile');
  const [scoreInput, setScoreInput] = useState<string>(
    profile.percentile ? String(profile.percentile) : '94.50'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    profile.category?.includes('OBC')
      ? 'OBC'
      : profile.category?.includes('SC')
      ? 'SC'
      : profile.category?.includes('ST')
      ? 'ST'
      : 'OPEN'
  );
  const [district, setDistrict] = useState<string>(
    profile.homeUniversity?.includes('Pune') ? 'Pune' : 'Pune'
  );
  const [gender, setGender] = useState<'Male' | 'Female'>(
    profile.gender === 'Female' ? 'Female' : 'Male'
  );
  const [isEWS, setIsEWS] = useState<boolean>(profile.isEWS || false);
  const [isTFWS, setIsTFWS] = useState<boolean>(profile.isTFWS || false);
  const [isPWD, setIsPWD] = useState<boolean>(profile.specialQuota === 'PWD');
  const [isDEF, setIsDEF] = useState<boolean>(profile.specialQuota === 'DEF');
  const [isOrphan, setIsOrphan] = useState<boolean>(profile.specialQuota === 'ORPHAN');
  const [includeMinority, setIncludeMinority] = useState<boolean>(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // Results & Filters
  const [datasetYear, setDatasetYear] = useState<'2026' | '2025'>('2026');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSafety, setFilterSafety] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [sortBy, setSortBy] = useState<'avg' | 'r1' | 'r2' | 'r3' | 'r4' | 'name'>('avg');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Accordion FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Success toast feedback
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Load Predictor Data once on mount
  useEffect(() => {
    setIsLoading(true);
    fetchPredictorData()
      .then(data => {
        setDataPayload(data);
        setIsLoading(false);
      })
      .catch(err => {
        setLoadError(err.message || 'Failed to load cutoff data');
        setIsLoading(false);
      });
  }, []);

  // Compute live eligible seat quotas
  const eligibleQuotas = useMemo(() => {
    return computeEligibleQuotas({
      examType,
      category: selectedCategory,
      gender,
      isEWS,
      isTFWS,
      isPWD,
      isDEF,
      isOrphan,
      includeMinority
    });
  }, [examType, selectedCategory, gender, isEWS, isTFWS, isPWD, isDEF, isOrphan, includeMinority]);

  // Execute prediction
  const predictedResults = useMemo(() => {
    if (!dataPayload) return [];

    const numScore = parseFloat(scoreInput) || 0;
    if (predictBy === 'percentile' && (numScore <= 0 || numScore > 100)) return [];
    if (predictBy === 'rank' && numScore <= 0) return [];

    return predictColleges(dataPayload, {
      examType,
      predictBy,
      score: numScore,
      category: selectedCategory,
      district,
      gender,
      isEWS,
      isTFWS,
      isPWD,
      isDEF,
      isOrphan,
      includeMinority,
      selectedBranches,
      selectedDistrictFilter: filterDistrict,
      selectedSafetyFilter: filterSafety,
      year: datasetYear,
      searchTerm
    });
  }, [
    dataPayload,
    examType,
    predictBy,
    scoreInput,
    selectedCategory,
    district,
    gender,
    isEWS,
    isTFWS,
    isPWD,
    isDEF,
    isOrphan,
    includeMinority,
    selectedBranches,
    filterDistrict,
    filterSafety,
    datasetYear,
    searchTerm
  ]);

  // Apply sorting
  const sortedResults = useMemo(() => {
    const list = [...predictedResults];
    const mult = sortOrder === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (sortBy === 'avg') {
        return (a.avg_percentile - b.avg_percentile) * mult;
      } else if (sortBy === 'r1') {
        return ((a.r1_percentile || 0) - (b.r1_percentile || 0)) * mult;
      } else if (sortBy === 'r2') {
        return ((a.r2_percentile || 0) - (b.r2_percentile || 0)) * mult;
      } else if (sortBy === 'r3') {
        return ((a.r3_percentile || 0) - (b.r3_percentile || 0)) * mult;
      } else if (sortBy === 'r4') {
        return ((a.r4_percentile || 0) - (b.r4_percentile || 0)) * mult;
      } else if (sortBy === 'name') {
        return a.college_name.localeCompare(b.college_name) * mult;
      }
      return 0;
    });

    return list;
  }, [predictedResults, sortBy, sortOrder]);

  // Pagination slice
  const paginatedResults = useMemo(() => {
    if (pageSize >= sortedResults.length) return sortedResults;
    const start = (currentPage - 1) * pageSize;
    return sortedResults.slice(start, start + pageSize);
  }, [sortedResults, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedResults.length / pageSize) || 1;

  // Automatically sync predictor inputs to global context
  useEffect(() => {
    const numScore = parseFloat(scoreInput);
    if (!isNaN(numScore) && numScore > 0) {
      updateProfile({
        percentile: predictBy === 'percentile' ? numScore : profile.percentile,
        rank: predictBy === 'rank' ? Math.round(numScore) : profile.rank,
        category: selectedCategory,
        gender: gender,
        homeUniversity: getUniversityForDistrict(district),
        isEWS,
        isTFWS,
        specialQuota: isPWD ? 'PWD' : isDEF ? 'DEF' : isOrphan ? 'ORPHAN' : 'None',
        preferredBranches: selectedBranches.length > 0 ? selectedBranches : profile.preferredBranches
      });
    }
  }, [scoreInput, predictBy, selectedCategory, gender, district, isEWS, isTFWS, isPWD, isDEF, isOrphan, selectedBranches]);

  // Quick branch toggle
  const toggleBranch = (br: string) => {
    if (selectedBranches.includes(br)) {
      setSelectedBranches(selectedBranches.filter(b => b !== br));
    } else {
      setSelectedBranches([...selectedBranches, br]);
    }
    setCurrentPage(1);
  };

  // Add to preference list handler
  const handleAddToPreferences = (item: PredictedItem) => {
    const branchCode = item.college_code * 1000 + 10;
    const branchObj: import('../../types').Branch = {
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

    const collegeObj: import('../../types').College = {
      college_code: item.college_code,
      college_name: item.college_name,
      district: item.district,
      institute_type: item.is_autonomous ? 'Autonomous' : 'Government/Aided',
      branches_count: 1,
      branches: [branchObj]
    };

    addPreference(collegeObj, branchObj, item.quota);

    setAddedSuccessId(item.id);
    setTimeout(() => {
      setAddedSuccessId(null);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner matching EduVale dual-language styling */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              CAP 2026 Engine
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              ✓ मोफत · Free Tool
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
              No Login Required
            </span>
            <span className="text-xs text-white/80 font-medium ml-auto hidden sm:inline">
              EN · मराठी · हिंदी
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2">
            MHT-CET College Predictor 2026
          </h1>
          <p className="text-sm sm:text-base text-brand-100 font-medium mb-3">
            Maharashtra Engineering & Pharmacy · CAP 2026 · डीटीई महाराष्ट्र अधिकृत डेटा
          </p>
          <p className="text-xs sm:text-sm text-brand-200/90 leading-relaxed max-w-3xl">
            तुमचा MHT CET percentile किंवा rank टाका — Maharashtra मधील 380+ engineering कॉलेजची
            CAP Round 1, 2, 3 & 4 कटऑफ्ससह instant यादी मिळवा.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/90">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>397,000+ Verified DTE Cutoff Records</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>380+ Engineering Institutes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-sky-300" />
              <span>Home & Other University (HU / OU) Logic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Prediction Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Form Title & Instruction */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Demographics & Quotas · प्रवर्ग
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your score → get matched colleges instantly across all 4 CAP rounds
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Type & Predict By Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Exam Type*
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setExamType('MHT-CET')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  examType === 'MHT-CET'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MHT CET (State CAP)
              </button>
              <button
                type="button"
                onClick={() => setExamType('JEE-Main')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  examType === 'JEE-Main'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JEE Main (All India / AI)
              </button>
            </div>
          </div>

          {/* Predict Using */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Predict Using*
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPredictBy('percentile')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  predictBy === 'percentile'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Percentile Score
              </button>
              <button
                type="button"
                onClick={() => setPredictBy('rank')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  predictBy === 'rank'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                State Merit Rank
              </button>
            </div>
          </div>
        </div>

        {/* Score Input Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {predictBy === 'percentile' ? 'Your Percentile Score*' : 'Your State Merit Rank*'}
            </label>
            <span className="text-[11px] text-slate-400">
              {predictBy === 'percentile'
                ? '0–100, up to 8 decimal places · उदा. 94.537634'
                : 'Merit rank as per CET Cell Provisional/Final merit list'}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step={predictBy === 'percentile' ? '0.0001' : '1'}
              min={predictBy === 'percentile' ? 0 : 1}
              max={predictBy === 'percentile' ? 100 : 250000}
              value={scoreInput}
              onChange={e => {
                setScoreInput(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={predictBy === 'percentile' ? '99.50' : '12500'}
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">
                {predictBy === 'percentile' ? '%ile' : 'Rank'}
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Presets:</span>
            {predictBy === 'percentile' ? (
              [99.5, 98.0, 95.0, 92.5, 88.0, 80.0, 65.0].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setScoreInput(val.toFixed(2));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                    parseFloat(scoreInput) === val
                      ? 'bg-brand-600 text-white border-brand-600 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val.toFixed(1)}
                </button>
              ))
            ) : (
              [1500, 5000, 10000, 20000, 40000, 75000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setScoreInput(String(val));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                    parseInt(scoreInput) === val
                      ? 'bg-brand-600 text-white border-brand-600 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val.toLocaleString()}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Caste Category Grid Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Caste Category*
            </label>
            <span className="text-[11px] text-slate-400">As on your caste/eligibility certificate</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CASTE_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.code;
              return (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.code);
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-600 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-extrabold ${
                        isSelected ? 'text-brand-700' : 'text-slate-900'
                      }`}
                    >
                      {cat.code}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">{cat.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{cat.marathi}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 12th District & Gender Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your 12th School/College District*
              </label>
              <span className="text-[11px] font-medium text-brand-600">For HU / OU zones</span>
            </div>
            <select
              value={district}
              onChange={e => {
                setDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all shadow-xs"
            >
              {MAHARASHTRA_DISTRICTS.map(d => (
                <option key={d} value={d}>
                  {d} (Home Uni: {getUniversityForDistrict(d)})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Determines Home University quota seats (GOPENH) vs Other University (GOPENO).
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gender · लिंग
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setGender('Male');
                  setCurrentPage(1);
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  gender === 'Male'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => {
                  setGender('Female');
                  setCurrentPage(1);
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  gender === 'Female'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Female (L Quota)
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Female candidates unlock additional 30% Ladies Quota (LOPENS, LOPENH, LOBC, etc.).
            </p>
          </div>
        </div>

        {/* Special Quotas & Additional Reservations */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Special Quotas & Additional Reservations
            </span>
            <span className="text-[11px] text-slate-500">
              Income, fee waivers and government reservation layers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* EWS */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isEWS
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isEWS}
                onChange={e => {
                  setIsEWS(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">EWS (Economically Weaker)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  10% state quota. OPEN category with income &lt; ₹8L/year.
                </div>
              </div>
            </label>

            {/* TFWS */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isTFWS
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isTFWS}
                onChange={e => {
                  setIsTFWS(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">TFWS (Fee Waiver Scheme)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  100% Tuition Fee waived. 5% supernumerary seats for all categories.
                </div>
              </div>
            </label>

            {/* PWD */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isPWD
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isPWD}
                onChange={e => {
                  setIsPWD(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">PWD / Divyang (40%+)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Layered on top of caste category (PWDOBC, PWDOPEN, etc.).
                </div>
              </div>
            </label>

            {/* DEF */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isDEF
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isDEF}
                onChange={e => {
                  setIsDEF(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Defence Ward Quota (DEF)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Children of Maharashtra defense personnel.
                </div>
              </div>
            </label>

            {/* Orphan */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isOrphan
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isOrphan}
                onChange={e => {
                  setIsOrphan(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Orphan Category (1%)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  1% state reservation for officially registered candidates.
                </div>
              </div>
            </label>

            {/* Minority Leftover */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                includeMinority
                  ? 'bg-brand-50/80 border-brand-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={includeMinority}
                onChange={e => {
                  setIncludeMinority(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Minority Institute Seats</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Include Minority leftover seats (MI-MH / MI-AI).
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Branch Preference Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Branch Preference (Blank = All Engineering Branches)
            </label>
            {selectedBranches.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBranches([]);
                  setCurrentPage(1);
                }}
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
              >
                Clear all ({selectedBranches.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_BRANCHES.map(br => {
              const active = selectedBranches.includes(br);
              return (
                <button
                  key={br}
                  type="button"
                  onClick={() => toggleBranch(br)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {active ? `✓ ${br}` : `+ ${br}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. YOUR ELIGIBLE SEAT QUOTAS BANNER (Directly matching EduVale PDF Page 2) */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                ✓ Your Eligible Seat Quotas
              </div>
              <p className="text-xs text-emerald-800 mb-3">
                Based on your category (<strong>{selectedCategory}</strong>), district (
                <strong>{district}</strong>) and gender (<strong>{gender}</strong>), you can legally
                compete for these seat types in Maharashtra CAP:
              </p>

              <div className="flex flex-wrap gap-1.5">
                {eligibleQuotas.map(q => (
                  <span
                    key={q}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-white text-emerald-800 border border-emerald-300 shadow-2xs"
                  >
                    {q}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-start gap-2 text-[11px] text-emerald-900">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-700" />
                <span>
                  <strong>Note:</strong> The percentiles shown in each column are official cutoff
                  thresholds. We check all 4 CAP rounds — if your score is higher than or equal to
                  the cutoff in <strong>ANY</strong> round, you have a realistic chance to secure a seat.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Results Section & Interactive Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Control Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Prediction Results
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                  {sortedResults.length} {sortedResults.length === 1 ? 'match' : 'matches'} found
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched against official CAP rounds cutoffs · Sorted by Cutoff Safety
              </p>
            </div>

            {/* Year Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Cutoff Year:</span>
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDatasetYear('2026')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    datasetYear === '2026'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2026 Predictions
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetYear('2025')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    datasetYear === '2025'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2025 Official CAP
                </button>
              </div>
            </div>
          </div>

          {/* Search and Secondary Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search college, branch, district..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </div>

            {/* Filter by District */}
            <div>
              <select
                value={filterDistrict}
                onChange={e => {
                  setFilterDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              >
                <option value="All">All Districts</option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Safety Tier */}
            <div>
              <select
                value={filterSafety}
                onChange={e => {
                  setFilterSafety(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              >
                <option value="All">All Feasibility Tiers</option>
                <option value="Safe">Safe / High Chance (≥ +1.5 %ile)</option>
                <option value="Realistic">Realistic / Moderate (±1.5 %ile)</option>
                <option value="Dream">Dream / Ambitious (-5.0 %ile)</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={999999}>All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Success toast alert */}
        {addedSuccessId && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Added to your personalized preference list!
            </span>
            <span className="text-[11px] opacity-90">View in Preference Builder</span>
          </div>
        )}

        {/* The Data Table (Exact EduVale columns) */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold">Loading official CAP cutoffs...</p>
          </div>
        ) : loadError ? (
          <div className="p-12 text-center text-rose-600">
            <p className="text-sm font-bold">{loadError}</p>
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No matching colleges found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your percentile/rank threshold, clearing branch filters, or including
              all districts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold tracking-wider uppercase text-[11px] select-none">
                  <th
                    className="p-3.5 pl-5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>COLLEGE</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">DIST</th>
                  <th className="p-3.5">UNI</th>
                  <th className="p-3.5">BRANCH</th>
                  <th className="p-3.5">QUOTA</th>
                  <th
                    className="p-3.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                    onClick={() => {
                      if (sortBy === 'r1') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('r1');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>R1 %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                    onClick={() => {
                      if (sortBy === 'r2') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('r2');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>R2 %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                    onClick={() => {
                      if (sortBy === 'r3') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('r3');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>R3 %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                    onClick={() => {
                      if (sortBy === 'r4') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('r4');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>R4 %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-right cursor-pointer bg-brand-50/50 hover:bg-brand-100/50 transition-colors"
                    onClick={() => {
                      if (sortBy === 'avg') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('avg');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1 text-brand-900 font-extrabold">
                      <span>AVG %</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">SAFETY</th>
                  <th className="p-3.5 pr-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedResults.map(item => {
                  const isPercentile = predictBy === 'percentile';
                  const inPref = isInPreferences(item.college_code, item.college_code * 1000 + 10);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* College Name & Meta */}
                      <td className="p-3.5 pl-5 max-w-xs sm:max-w-sm">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-bold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors">
                              {item.college_name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="font-mono text-[10px] text-slate-400">
                                #{item.college_code}
                              </span>
                              {item.is_autonomous && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Autonomous
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* District */}
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{item.district}</td>

                      {/* University */}
                      <td className="p-3.5 text-slate-600 max-w-[140px] truncate" title={item.university}>
                        {item.university}
                      </td>

                      {/* Branch */}
                      <td className="p-3.5 font-semibold text-slate-800 max-w-[180px]">
                        {item.branch_name}
                      </td>

                      {/* Quota */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.quota}
                        </span>
                      </td>

                      {/* Round 1 */}
                      <td className="p-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        {isPercentile
                          ? item.r1_percentile !== null
                            ? item.r1_percentile.toFixed(3)
                            : '—'
                          : item.r1_rank
                          ? item.r1_rank.toLocaleString()
                          : '—'}
                      </td>

                      {/* Round 2 */}
                      <td className="p-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        {isPercentile
                          ? item.r2_percentile !== null
                            ? item.r2_percentile.toFixed(3)
                            : '—'
                          : item.r2_rank
                          ? item.r2_rank.toLocaleString()
                          : '—'}
                      </td>

                      {/* Round 3 */}
                      <td className="p-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        {isPercentile
                          ? item.r3_percentile !== null
                            ? item.r3_percentile.toFixed(3)
                            : '—'
                          : item.r3_rank
                          ? item.r3_rank.toLocaleString()
                          : '—'}
                      </td>

                      {/* Round 4 */}
                      <td className="p-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        {isPercentile
                          ? item.r4_percentile !== null
                            ? item.r4_percentile.toFixed(3)
                            : '—'
                          : item.r4_rank
                          ? item.r4_rank.toLocaleString()
                          : '—'}
                      </td>

                      {/* AVG Cutoff */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 bg-brand-50/40 whitespace-nowrap">
                        {isPercentile
                          ? item.avg_percentile.toFixed(3)
                          : item.avg_rank.toLocaleString()}
                      </td>

                      {/* Safety / Reachability Badge */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {item.safety === 'Safe' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            🟢 Safe
                          </span>
                        ) : item.safety === 'Realistic' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            🟡 Realistic
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            🟣 Dream
                          </span>
                        )}
                      </td>

                      {/* Add Action */}
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        {inPref ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <Check className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToPreferences(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add Choice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {sortedResults.length > pageSize && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedResults.length)} of {sortedResults.length}{' '}
              results
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Rich EduVale Reference Sections */}
      {/* 5A. 4 Key Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-brand-600">380+</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Colleges</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Govt, Aided & Autonomous</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-indigo-600">4</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">CAP Rounds</div>
          <div className="text-[11px] text-slate-400 mt-0.5">R1, R2, R3 & R4 Included</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-emerald-600">10+</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Categories</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full Quota Breakdown</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-amber-600">397K+</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Records</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Official DTE Merit Records</div>
        </div>
      </div>

      {/* 5B. How It Works (कसे वापरावे) 5-Step Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            HOW IT WORKS · कसे वापरावे
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            5 Simple Steps to Find Your Safest Engineering Seats
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              1
            </span>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Select Exam Type</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Choose MHT-CET for Maharashtra State CAP seats or JEE Main for All-India (AI) quota.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              2
            </span>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Enter Score or Rank</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Type your exact percentile (up to 8 decimal places) or your official General Merit Rank.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              3
            </span>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Pick Category & District</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your 12th district automatically configures Home University (HU) vs Outside (OU) quotas.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              4
            </span>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Filter Preferred Branches</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Narrow down results to Computer, AI & Data Science, IT, Mechanical, etc.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-3">
              5
            </span>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Sorted by Cutoff Safety</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              View colleges sorted by historical safety margin and one-click add to your option list.
            </p>
          </div>
        </div>
      </div>

      {/* 5C. Maharashtra Reservation Categories Reference Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            OFFICIAL REFERENCE GUIDE
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Maharashtra Reservation Categories & CAP Quota Codes
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Official DTE Maharashtra classification and seat quota allotment rules
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <th className="p-3">CODE</th>
                <th className="p-3">FULL NAME</th>
                <th className="p-3">मराठी नाव</th>
                <th className="p-3">CAP QUOTA CODES</th>
                <th className="p-3">ELIGIBILITY & RULES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">OPEN</td>
                <td className="p-3 font-semibold text-slate-800">Open / General</td>
                <td className="p-3 text-slate-600">खुला प्रवर्ग</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GOPENS, GOPEN, LOPENS, GOPENH, GOPENO</td>
                <td className="p-3 text-slate-600">All students eligible. EWS sub-quota for economically weaker OPEN candidates.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">OBC</td>
                <td className="p-3 font-semibold text-slate-800">Other Backward Class</td>
                <td className="p-3 text-slate-600">इतर मागासवर्ग</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GOBCS, GOBCH, GOBCO, LOBCS, LOBCH</td>
                <td className="p-3 text-slate-600">Requires valid Non-Creamy Layer (NCL) certificate issued for the admission year.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">SC</td>
                <td className="p-3 font-semibold text-slate-800">Scheduled Caste</td>
                <td className="p-3 text-slate-600">अनुसूचित जाती</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GSCS, GSCH, GSCO, LSCS, LSCH</td>
                <td className="p-3 text-slate-600">Includes Dalit and Neo-Buddhist communities. Caste Validity Certificate mandatory.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">ST</td>
                <td className="p-3 font-semibold text-slate-800">Scheduled Tribe</td>
                <td className="p-3 text-slate-600">अनुसूचित जमाती</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GSTS, GSTH, GSTO, LSTS, LSTH</td>
                <td className="p-3 text-slate-600">Tribal communities. Special district preferences apply in scheduled tribal areas.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">VJ/DT</td>
                <td className="p-3 font-semibold text-slate-800">Vimukta Jati / NT-A</td>
                <td className="p-3 text-slate-600">विमुक्त जाती</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GVJAS, GVJAH, GVJAO, LVJAS</td>
                <td className="p-3 text-slate-600">Formerly nomadic and denotified tribal groups. Requires NCL certificate.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">NT-B</td>
                <td className="p-3 font-semibold text-slate-800">Nomadic Tribe B</td>
                <td className="p-3 text-slate-600">भटक्या जमाती (ब)</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GNT1S, GNT1H, GNT1O, LNT1S</td>
                <td className="p-3 text-slate-600">Nomadic Tribe B communities under Maharashtra government gazette.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">NT-C</td>
                <td className="p-3 font-semibold text-slate-800">Nomadic Tribe C</td>
                <td className="p-3 text-slate-600">भटक्या जमाती (क)</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GNT2S, GNT2H, GNT2O, LNT2S</td>
                <td className="p-3 text-slate-600">Includes Dhangar and allied traditional communities.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">NT-D</td>
                <td className="p-3 font-semibold text-slate-800">Nomadic Tribe D</td>
                <td className="p-3 text-slate-600">भटक्या जमाती (ड)</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GNT3S, GNT3H, GNT3O, LNT3S</td>
                <td className="p-3 text-slate-600">Nomadic Tribe D communities under Maharashtra state classification.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">SEBC</td>
                <td className="p-3 font-semibold text-slate-800">SEBC / Maratha</td>
                <td className="p-3 text-slate-600">मराठा आरक्षण</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">GSEBCS, GSEBCH, GSEBCO, LSEBCS</td>
                <td className="p-3 text-slate-600">10% Maratha community reservation under the Maharashtra SEBC Act.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">EWS</td>
                <td className="p-3 font-semibold text-slate-800">Economically Weaker Section</td>
                <td className="p-3 text-slate-600">आर्थिकदृष्ट्या दुर्बल</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">EWS, GEWS, LEWS</td>
                <td className="p-3 text-slate-600">OPEN category candidates only. Annual family income under ₹8 lakh.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">TFWS</td>
                <td className="p-3 font-semibold text-slate-800">Tuition Fee Waiver Scheme</td>
                <td className="p-3 text-slate-600">शुल्क माफी योजना</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">TFWS, GTFWS</td>
                <td className="p-3 text-slate-600">All categories eligible. 100% tuition waiver. Merit based allocation.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">SBC</td>
                <td className="p-3 font-semibold text-slate-800">Special Backward Class</td>
                <td className="p-3 text-slate-600">विशेष मागास प्रवर्ग</td>
                <td className="p-3 font-mono text-[11px] text-brand-700">SBC, GSBCS</td>
                <td className="p-3 text-slate-600">Flat state-level code — no Home/Other University split in CAP records.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5D. Frequently Asked Questions Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            KNOWLEDGE BASE
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions · वारंवार विचारले जाणारे प्रश्न
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              q: 'How accurate is this college predictor?',
              a: 'Our predictor uses verified, official DTE Maharashtra CAP Round 1, 2, 3, and 4 cutoff records from CET Cell merit rounds across all academic years (397,000+ records). It does not use crowdsourced guesses or generic estimates. Cutoffs represent true historic closing percentiles and ranks.'
            },
            {
              q: 'What is the difference between Percentile and State Merit Rank?',
              a: 'Percentile indicates the percentage of candidates who scored equal to or lower than you in MHT-CET (e.g. 95.00 means you outscored 95% of test takers). State Merit Rank is your exact serial position on the state-wide provisional and final merit list released by CET Cell.'
            },
            {
              q: 'What is Home University (HU) vs Outside University (OU)?',
              a: 'Maharashtra CAP reserves a substantial portion (typically 70% in non-autonomous colleges) for candidates who passed their 12th standard exam within the affiliating university jurisdiction (Home University - HU). Candidates from other districts compete for Outside University (OU) seats or State Level (GOPENS) seats.'
            },
            {
              q: 'What is TFWS? How is it different from regular admission?',
              a: 'TFWS (Tuition Fee Waiver Scheme) offers 100% exemption on college tuition fees. Up to 5% supernumerary seats are created in every approved branch. Any student with family income under ₹8 lakh is eligible regardless of caste, but cutoffs are significantly higher due to intense competition.'
            },
            {
              q: 'What is EWS quota? Who is eligible?',
              a: 'EWS provides 10% reservation exclusively for General/OPEN category candidates whose gross annual family income is below ₹8 lakh and who do not belong to SC, ST, OBC, VJ/DT, or NT categories. A valid state EWS certificate is mandatory.'
            },
            {
              q: 'How many CAP rounds are there? Should I wait for later rounds?',
              a: 'Maharashtra CET Cell conducts 4 centralized CAP rounds. Cutoffs generally ease slightly from CAP Round 1 to Round 3, while Round 4 deals with institute-level dynamic vacancy mop-up. If you get a desirable seat in Round 1 or 2, consider Betterment or Freeze wisely.'
            },
            {
              q: 'Can JEE Main students participate in Maharashtra CAP?',
              a: 'Yes! 15% of seats in government, aided, and un-aided private engineering institutions are reserved for All India (AI) candidates who appear for JEE Main. They compete under the AI quota codes.'
            },
            {
              q: 'Why does the same college show multiple rows?',
              a: 'Each row corresponds to a unique course branch and seat pool quota (e.g., COEP Computer Engineering has GOPENS, GSC, GOBC, TFWS, and EWS pools). Each pool has its own distinct cutoff threshold based on seat reservation policies.'
            }
          ].map((item, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-brand-600 transition-colors"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Official Counselling Disclaimer:</strong> This prediction engine utilizes
          historical CET Cell CAP Round 1–4 allotment databases to provide probability estimates.
          Actual cutoffs fluctuate annually based on candidate applicant counts, seat matrices, and
          category demand. Always verify your official seat choices against the official DTE
          Maharashtra counselling website (cetcell.mahacet.org).
        </div>
      </div>
    </div>
  );
};
