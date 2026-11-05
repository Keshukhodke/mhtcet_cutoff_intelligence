import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  LineChart,
  ListOrdered,
  Activity,
  ArrowRight,
  ShieldCheck,
  Database,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DataFreshnessIndicator } from '../../components/common/DataFreshnessIndicator';
import { AdmissionToolsHub } from '../../components/common/AdmissionToolsHub';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Aapla Katta Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base leading-tight">
                Aapla Katta
              </span>
              <span className="text-xs text-brand-600 font-medium tracking-wide">
                College Predictor
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/predictor" className="text-brand-600 font-bold hover:text-brand-700 transition-colors flex items-center gap-1.5">
              <span>Predictor 2026</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 font-extrabold uppercase">New</span>
            </Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#transparency" className="hover:text-slate-900 transition-colors">Data & Model</a>
            <Link to="/settings" className="hover:text-slate-900 transition-colors">Disclaimers</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/predictor"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-all"
            >
              <span>Predict My Colleges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex mb-4">
            <DataFreshnessIndicator lastUpdated="2026-10-22" recordsCount={397152} />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Make Your Next College Decision{' '}
            <span className="text-brand-600 underline decoration-brand-200 underline-offset-4">
              With Confidence.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            Stop guessing your engineering admission chances with outdated single-year PDFs.
            Our platform couples <strong>397,000+ verified historical MHT-CET CAP cutoff records</strong> with
            calibrated machine learning forecasting to guide your seat strategy and preference list.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Link
              to="/predictor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-extrabold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg transition-all"
            >
              <span>🔮 Launch College Predictor 2026</span>
            </Link>
            <Link
              to="/explorer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Colleges & Cutoffs</span>
            </Link>
            <Link
              to="/preference-builder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <ListOrdered className="w-4 h-4" />
              <span>Build Preference List</span>
            </Link>
          </div>

          {/* Genuine Interactive UI Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-card text-left max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Live Admission Intelligence Preview
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  College of Engineering, Pune (COEP) • Computer Engineering
                </h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                Model Forecast • CAP1 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">CAP 2025 Closing (Actual)</span>
                <p className="text-xl font-bold text-slate-900 mt-1">99.85 %ile</p>
                <span className="text-[11px] text-slate-400">GOPENS Quota (Final Round)</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-brand-200 bg-brand-50/20">
                <span className="text-xs text-brand-700 font-semibold">2026 CAP1 Forecast</span>
                <p className="text-xl font-bold text-brand-600 mt-1">99.89 %ile</p>
                <span className="text-[11px] text-slate-500">Confidence Band: 99.82 - 99.95</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Approved Branch Intake</span>
                <p className="text-xl font-bold text-slate-900 mt-1">120 Seats</p>
                <span className="text-[11px] text-emerald-600 font-medium">Verified Official Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features & MHT CET Tools Section */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* MHT CET Admission Tools Hub Suite */}
        <AdmissionToolsHub />

        <div>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Engineered For Decisions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
              Beyond Simple Percentile Matchers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Standard cutoffs vary significantly between Round 1 opening and Round 4 closing.
              Our platform models the structural dynamics of state admissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:border-brand-300 transition-all">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl w-fit mb-4">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Cutoff Forecasting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tuned Random Forest + Extra Trees ensemble that captures transition dynamics from closing rounds to CAP1.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:border-brand-300 transition-all">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">College Explorer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-dimensional search across 362 Maharashtra engineering colleges, 100 branches, and 83 reservation categories.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:border-brand-300 transition-all">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
              <ListOrdered className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">CAP Preference Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive workspace to construct and reorder your option list with automatic duplicate detection and reachability tags.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:border-brand-300 transition-all">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Preference List Health</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rule-based diagnostics that flag risk of overconcentration, lack of safe backups, and insufficient district diversification.
            </p>
          </div>
        </div>
      </div>
    </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Clear Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-3">
              Four Steps to a Strategic CAP List
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-brand-600 mb-2">01</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Enter Verified Score</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide your MHT-CET percentile, home university region, and applicable reservation category.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black text-brand-600 mb-2">02</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Review Model Forecasts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Examine predicted CAP1 cutoffs alongside multi-year round trends and intake capacities.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black text-brand-600 mb-2">03</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Categorize Reachability</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Colleges are labeled as Reachable (safe), Borderline (realistic), or Ambitious (dream) using transparent criteria.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black text-brand-600 mb-2">04</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Audit & Export</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run the health checker on your preference list, reorder choices safely, and export for official submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Data & Model Transparency Section */}
      <section id="transparency" className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Integrity & Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Transparent Data Architecture & Verified Boundaries
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            All cutoff data originates directly from official State CET Cell Maharashtra CAP round publications (2022 to 2026).
            Our cleaning pipeline repaired header corruptions and quarantined anomalies without using fabricated mean/mode imputation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div>
              <span className="text-xs text-slate-400">Total Clean Records</span>
              <p className="text-xl font-bold text-white mt-1">397,152</p>
              <span className="text-[11px] text-slate-400">0 fabricated rows</span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Model Tested Rows</span>
              <p className="text-xl font-bold text-white mt-1">27,836</p>
              <span className="text-[11px] text-slate-400">Real 2026 test set</span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Elite Institute Acc.</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">93.41%</p>
              <span className="text-[11px] text-slate-400">Within ±5 percentiles</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Aapla Katta" className="w-8 h-8 object-contain rounded" />
              <span className="font-bold text-slate-900 text-sm">Aapla katta College Predictor</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
              <Link to="/explorer" className="hover:text-slate-900">College Explorer</Link>
              <Link to="/forecasts" className="hover:text-slate-900">Cutoff Forecasts</Link>
              <Link to="/preference-builder" className="hover:text-slate-900">Preference Builder</Link>
              <Link to="/settings" className="hover:text-slate-900">Disclaimers & Privacy</Link>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400 leading-relaxed">
            <p className="mb-2">
              © {new Date().getFullYear()} Aapla Katta. All Rights Reserved.
            </p>
            <p className="max-w-2xl mx-auto text-[11px] text-slate-400">
              Disclaimer: This platform is an independent educational decision-support tool. It is not affiliated with or endorsed by the State CET Cell, Directorate of Technical Education (DTE) Maharashtra, or any participating university. Cutoffs are historical and projected estimates. Official allotments are determined exclusively by official merit lists and seat availability.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
