import React from 'react';
import { AGENCIES, type AgencyInfo } from '../lib/layer-semantics';

interface AgencyBadgeProps {
  agency: AgencyInfo | string;
  showFullName?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const AgencyBadge: React.FC<AgencyBadgeProps> = ({
  agency,
  showFullName = false,
  size = 'xs',
  className = '',
}) => {
  const info: AgencyInfo | undefined =
    typeof agency === 'string' ? AGENCIES[agency.toUpperCase()] : agency;

  if (!info) {
    const rawLabel = typeof agency === 'string' ? agency : 'DATA';
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono font-bold text-[9px] bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
      >
        {rawLabel}
      </span>
    );
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[8.5px] font-mono',
    sm: 'px-2 py-0.5 text-[10px] font-mono',
    md: 'px-2.5 py-1 text-xs font-mono font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-bold tracking-wider transition-all duration-150 shadow-sm ${sizeClasses} ${className}`}
      style={{
        backgroundColor: info.badgeBg,
        color: info.badgeText,
        border: `1px solid ${info.badgeBorder}`,
      }}
      title={`${info.name} (${info.headquarters})`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.badgeText }} />
      <span>{showFullName ? info.shortName : info.code}</span>
    </span>
  );
};

export default AgencyBadge;
