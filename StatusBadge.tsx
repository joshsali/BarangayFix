import React from 'react';
import { cn } from '../lib/utils';

export type ReportStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    'Submitted': 'bg-zinc-100 text-zinc-500 border-zinc-200',
    'Under Review': 'bg-yellow-50 text-yellow-600 border-yellow-100',
    'In Progress': 'bg-red-50 text-red-700 border-red-100',
    'Resolved': 'bg-green-50 text-green-600 border-green-100',
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] transition-all",
      styles[status],
      className
    )}>
      {status}
    </span>
  );
}
