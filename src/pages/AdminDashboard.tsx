import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, Search, LayoutGrid, List, MoreVertical, Loader2, Eye, CheckCircle, Clock, AlertCircle, Trash2, MapPin, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import StatusBadge, { ReportStatus } from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import AdminChatbot from '../components/AdminChatbot';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (reportId: string, currentStatus: ReportStatus, newStatus: ReportStatus) => {
    if (currentStatus === newStatus) return;
    setUpdatingId(reportId);

    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Log the change
      await addDoc(collection(db, 'reports', reportId, 'logs'), {
        reportId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy: 'Admin',
        timestamp: serverTimestamp(),
        note: `Status updated from ${currentStatus} to ${newStatus} by Admin.`
      });
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reports.length,
    urgent: reports.filter(r => r.urgency === 'High' && r.status !== 'Resolved').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
    pending: reports.filter(r => r.status === 'Submitted').length,
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Header with Professional Style */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-700">
              <ShieldCheck className="h-3 w-3" />
              Official Admin Portal
            </div>
            <h1 className="font-sans text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl">
              OFFICIAL <span className="text-zinc-300">PANEL</span>.
            </h1>
            <p className="max-w-xl text-lg font-medium text-zinc-500">
              Manage infrastructure resolutions for Barangay San Lorenzo. Use the AI Assistant to gain insights into community needs.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/map" className="group flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-8 py-5 text-lg font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300">
              <MapPin className="h-5 w-5" />
              Global Map View
            </Link>
          </div>
        </header>

        {/* Stats Grid - Professional Style */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          <StatCard label="Total Reports" value={stats.total.toString()} icon={<List className="h-5 w-5" />} color="zinc" />
          <StatCard label="Urgent Issues" value={stats.urgent.toString()} icon={<AlertCircle className="h-5 w-5" />} color="red" />
          <StatCard label="Resolved" value={stats.resolved.toString()} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
          <StatCard label="New Submissions" value={stats.pending.toString()} icon={<Clock className="h-5 w-5" />} color="amber" />
        </div>

        {/* Filters & Search - Professional Style */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title or description..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-5 pr-4 pl-12 text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-zinc-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-8 py-5 font-bold text-zinc-700 outline-none focus:border-red-500 transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table Shell - Clean Utility Style */}
        <div className="overflow-hidden rounded-[40px] border border-zinc-100 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Report Details</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Category</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Urgency</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-red-700" />
                      <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Fetching community data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold text-zinc-900 group-hover:text-red-700 transition-colors">{report.title}</span>
                        <span className="text-xs text-zinc-400 italic">
                          {report.createdAt?.toDate ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{report.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        report.urgency === 'High' ? 'text-red-600' : report.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      )}>
                        {report.urgency}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={report.status} />
                        {updatingId === report.id && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          to={`/report/${report.id}`}
                          className="rounded-xl bg-zinc-50 p-3 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report.id, report.status, e.target.value as ReportStatus)}
                          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-500 outline-none focus:border-red-500 transition-all"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="rounded-xl bg-zinc-50 p-3 text-zinc-300 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="h-12 w-12 text-zinc-200" />
                      <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">No reports found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AdminChatbot reports={reports} />
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
