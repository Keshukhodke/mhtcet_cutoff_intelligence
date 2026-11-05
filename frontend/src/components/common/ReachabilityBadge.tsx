import React from 'react';
import { ReachabilityLevel } from '../../types';

interface ReachabilityBadgeProps {
  level: ReachabilityLevel;
  diff?: number;
  showDiff?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ReachabilityBadge: React.FC<ReachabilityBadgeProps> = ({
  level,
  diff,
  showDiff = false,
  size = 'md'
}) => {
  const getStyles = () => {
    switch (level) {
      case 'Reachable':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Borderline':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ambitious':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Very Low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (level) {
      case 'Reachable':
        return 'bg-emerald-500';
      case 'Borderline':
        return 'bg-amber-500';
      case 'Ambitious':
        return 'bg-rose-500';
      case 'Very Low':
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getStyles()} ${sizeClasses}`}
      title={level}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{level}</span>
      {showDiff && diff !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">
          ({diff > 0 ? `+${diff}` : diff}%)
        </span>
      )}
    </span>
  );
};
