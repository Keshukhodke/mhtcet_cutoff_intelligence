import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ListOrdered,
  FileSpreadsheet,
  Award,
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Scale
} from 'lucide-react';

export const ADMISSION_TOOLS = [
  {
    title: 'College Predictor 2026',
    marathi: 'कॉलेज प्रेडिक्टर',
    badge: 'CAP 2026',
    badgeColor: 'bg-amber-400 text-slate-950',
    desc: 'Enter your percentile or merit rank → get matched colleges instantly across all 4 CAP rounds with Home vs Other University quota logic.',
    to: '/predictor',
    icon: Sparkles,
    iconBg: 'bg-amber-50 text-amber-600',
    btnText: 'Launch Predictor'
  },
  {
    title: 'CAP Preference List Builder',
    marathi: 'वेब ऑप्शन्स जनरेटर',
    badge: 'Live Tool',
    badgeColor: 'bg-emerald-500 text-white',
    desc: 'Strategically build, organize and auto-generate your college-branch preference list for CAP option entry. Drag, reorder, and export your list.',
    to: '/preference-builder',
    icon: ListOrdered,
    iconBg: 'bg-emerald-50 text-emerald-600',
    btnText: 'Build Options List'
  },
  {
    title: 'CAP Allotment Explorer',
    marathi: 'अधिकृत अलॉटमेंट डेटा',
    badge: '397K+ Records',
    badgeColor: 'bg-blue-600 text-white',
    desc: 'Explore official allotment records by college and branch across CAP 1, 2, 3 & 4 — closing ranks, category-wise cutoffs, and seat-fill patterns.',
    to: '/allotments',
    icon: FileSpreadsheet,
    iconBg: 'bg-blue-50 text-blue-600',
    btnText: 'Explore Allotments'
  },
  {
    title: 'Top Engineering Colleges',
    marathi: 'सर्वोत्तम इंजिनिअरिंग कॉलेज',
    badge: 'Ranked',
    badgeColor: 'bg-purple-600 text-white',
    desc: 'Browse Maharashtra engineering colleges branch-wise, ranked by closing cutoff percentiles and student preferences.',
    to: '/top-colleges',
    icon: Award,
    iconBg: 'bg-purple-50 text-purple-600',
    btnText: 'Browse Top Colleges'
  },
  {
    title: 'Branch Wise College Finder',
    marathi: 'ब्रांच वाईज कॉलेज शोध',
    badge: 'Interactive',
    badgeColor: 'bg-teal-600 text-white',
    desc: 'Discover all institutions offering your desired branch filtered by district, university, autonomous status, and intake strength.',
    to: '/explorer',
    icon: Compass,
    iconBg: 'bg-teal-50 text-teal-600',
    btnText: 'Find by Branch'
  },
  {
    title: 'Historical Cutoff Analyzer',
    marathi: 'ऐतिहासिक कटऑफ आणि डीप ॲनालिटिक्स',
    badge: 'Deep Analytics Free',
    badgeColor: 'bg-orange-500 text-white',
    desc: '5-year cutoff trend graphs (2021-2026), round-by-round closing percentiles, seat intake metrics, and category applicant distribution without login.',
    to: '/trends',
    icon: TrendingUp,
    iconBg: 'bg-orange-50 text-orange-600',
    btnText: 'Open Cutoff Analyzer'
  },
  {
    title: 'Preference Health Analyzer',
    marathi: 'ऑप्शन्स रिस्क विश्लेषण',
    badge: 'AI Calibrated',
    badgeColor: 'bg-rose-500 text-white',
    desc: 'Evaluate your option list against concentration risks, district diversity, and reachability balance to ensure guaranteed seat allocation.',
    to: '/preference-health',
    icon: ShieldCheck,
    iconBg: 'bg-rose-50 text-rose-600',
    btnText: 'Analyze Health'
  }
];

export const AdmissionToolsHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            MAHARASHTRA COUNSELLING SUITE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            MHT CET Admission Tools
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Free tools to help you navigate every step of Maharashtra engineering admissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADMISSION_TOOLS.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tool.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {tool.title}
                </h3>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{tool.marathi}</div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">{tool.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={tool.to}
                  className="inline-flex items-center justify-between w-full text-xs font-bold text-brand-600 group-hover:text-brand-700 hover:underline"
                >
                  <span>{tool.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
