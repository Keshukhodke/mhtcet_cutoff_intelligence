import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Compass,
  LineChart,
  Target,
  ListOrdered,
  Activity,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { usePreferences } from '../../context/PreferenceContext';

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { preferences } = usePreferences();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/predictor', label: 'College Predictor', icon: Sparkles, badgeText: '2026' },
    {
      to: '/preference-builder',
      label: 'Preference Builder',
      icon: ListOrdered,
      badge: preferences.length > 0 ? preferences.length : undefined
    },
    { to: '/allotments', label: 'CAP Allotment Data', icon: FileSpreadsheet },
    { to: '/top-colleges', label: 'Top Colleges', icon: Award },
    { to: '/explorer', label: 'College Explorer', icon: Compass },
    { to: '/forecasts', label: 'Cutoff Forecasts', icon: LineChart },
    { to: '/reachability', label: 'Reachability Analysis', icon: Target },
    { to: '/preference-health', label: 'Preference Health', icon: Activity },
    { to: '/trends', label: 'Historical Cutoff Analyzer', icon: History, badgeText: 'Deep' },
    { to: '/settings', label: 'Settings & Data', icon: Settings }
  ];

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 overflow-hidden" onClick={onMobileClose}>
          <img
            src="/logo.png"
            alt="Aapla Katta"
            className="w-9 h-9 object-contain rounded-lg shrink-0 shadow-sm"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
                Aapla Katta
              </span>
              <span className="text-[11px] font-medium text-brand-600 tracking-wide">
                College Predictor
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && (item as any).badgeText && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {(item as any).badgeText}
                </span>
              )}
              {!isCollapsed && item.badge !== undefined && (
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-100 text-brand-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Public Link */}
      <div className="p-3 border-t border-slate-100">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-brand-600 hover:bg-brand-50/50 transition-colors ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
          title="Back to Landing Page"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Public Portal</span>}
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
