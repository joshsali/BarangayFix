import React from 'react';
import { MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import StatusBadge, { ReportStatus } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    category: string;
    urgency: "Low" | "Medium" | "High";
    status: ReportStatus;
    createdAt: any;
    photoUrl?: string | null;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const urgencyStyles = {
    'High': 'text-red-600 bg-red-50 border-red-100',
    'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-100',
    'Low': 'text-green-600 bg-green-50 border-green-100',
  };

  return (
    <Link 
      to={`/report/${report.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[32px] border border-zinc-100 bg-white shadow-sm transition-all hover:border-red-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
    >
      {report.photoUrl && (
        <div className="h-56 w-full overflow-hidden">
          <img 
            src={report.photoUrl} 
            alt={report.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4">
            <StatusBadge status={report.status} className="shadow-lg" />
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-8 space-y-6">
        {!report.photoUrl && (
          <div className="flex items-center justify-between">
            <StatusBadge status={report.status} />
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              urgencyStyles[report.urgency]
            )}>
              <AlertTriangle className="h-3 w-3" />
              {report.urgency}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-red-700 transition-colors leading-tight">{report.title}</h3>
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{report.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {report.createdAt?.toDate ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            San Lorenzo
          </div>
          {report.photoUrl && (
            <div className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1",
              urgencyStyles[report.urgency]
            )}>
              {report.urgency}
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-zinc-50">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 group-hover:text-zinc-400 transition-colors">{report.category}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-300 group-hover:bg-red-700 group-hover:text-white transition-all">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
