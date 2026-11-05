import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { usePreferences } from '../../context/PreferenceContext';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  const { toastMessage, clearToast } = usePreferences();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Side: Mobile Menu + Title info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Cycle: <strong>2026-2027</strong></span>
            </span>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              CAP Round 1 Forecast
            </span>
          </div>
        </div>

        {/* Right Side: Quick Clean Status / Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/predictor"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors"
          >
            <span>🔮 College Predictor 2026</span>
          </Link>
        </div>
      </div>

      {/* Embedded Toast Feedback */}
      {toastMessage && (
        <div className="bg-brand-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button
            onClick={clearToast}
            className="underline opacity-80 hover:opacity-100 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
