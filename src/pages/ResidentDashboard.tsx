import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2, Sparkles, MapPin, Search, Filter } from 'lucide-react';
import ReportModal from '../components/ReportModal';
import ReportCard from '../components/ReportCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function ResidentDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    total: reports.length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
    pending: reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length,
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Header with Professional Style */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-700">
              <MapPin className="h-3 w-3" />
              Barangay San Lorenzo, Makati
            </div>
            <h1 className="font-sans text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl">
              RESIDENT <span className="text-zinc-300">PORTAL</span>.
            </h1>
            <p className="max-w-xl text-lg font-medium text-zinc-500">
              Welcome back! Track your reports and help us keep San Lorenzo the best place to live.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-red-700 px-8 py-5 text-lg font-bold text-white transition-all hover:bg-red-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20"
          >
            <Plus className="h-6 w-6" />
            New Report
          </button>
        </header>

        {/* Stats Grid - Professional Style */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          <StatCard label="Total Reports" value={stats.total.toString()} icon={<FileText className="h-5 w-5" />} color="zinc" />
          <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<Clock className="h-5 w-5" />} color="red" />
          <StatCard label="Resolved" value={stats.resolved.toString()} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
          <StatCard label="Pending" value={stats.pending.toString()} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">Your Submissions</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="rounded-xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-12 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 transition-all"
                />
              </div>
              <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900 transition-all">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-red-700" />
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Loading your data...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report: any) => {
                const Card = ReportCard as any;
                return <Card key={report.id} report={report} />;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[40px] border border-dashed border-zinc-200 bg-zinc-50/50 py-32 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-300">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-zinc-900">No reports found</h3>
              <p className="mt-2 max-w-sm text-zinc-500">
                {searchQuery ? "No reports match your search criteria. Try a different keyword." : "You haven't submitted any reports yet. Click 'New Report' to start."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 rounded-2xl bg-zinc-900 px-8 py-3 font-bold text-white transition-all hover:bg-zinc-800 hover:scale-105"
                >
                  Submit First Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    zinc: "bg-zinc-50 text-zinc-900 border-zinc-100",
    red: "bg-red-50 text-red-700 border-red-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className={`flex flex-col gap-4 rounded-3xl border p-8 transition-all hover:scale-[1.02] ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
        {icon}
      </div>
      <span className="text-5xl font-black">{value}</span>
    </div>
  );
}
