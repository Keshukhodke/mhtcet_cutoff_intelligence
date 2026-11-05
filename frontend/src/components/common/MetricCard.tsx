import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge}
          {icon && <div className="text-slate-400 p-1 bg-slate-50 rounded-lg">{icon}</div>}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
};
