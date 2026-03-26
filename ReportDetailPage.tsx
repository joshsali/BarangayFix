import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, MapPin, Clock, Calendar, User, AlertTriangle, FileText, Loader2, Activity, ShieldCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow, format } from 'date-fns';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      const reportDoc = await getDoc(doc(db, 'reports', id));
      if (reportDoc.exists()) {
        setReport({ id: reportDoc.id, ...reportDoc.data() });
      } else {
        navigate('/resident');
      }
    };

    const q = query(collection(db, 'reports', id, 'logs'), orderBy('timestamp', 'desc'));
    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setLoading(false);
    });

    fetchReport();
    return () => unsubscribeLogs();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-red-700" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-6">
        <Link 
          to={window.location.pathname.includes('admin') ? '/admin' : '/resident'} 
          className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-red-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Community Feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <StatusBadge status={report.status} />
                <span className={cn(
                  "rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                  report.urgency === 'High' ? 'border-red-100 bg-red-50 text-red-700' :
                  report.urgency === 'Medium' ? 'border-yellow-100 bg-yellow-50 text-yellow-600' :
                  'border-green-100 bg-green-50 text-green-600'
                )}>
                  {report.urgency} Urgency
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-zinc-900 uppercase leading-[0.9]">{report.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {report.createdAt?.toDate ? format(report.createdAt.toDate(), 'PPP p') : 'Just now'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  San Lorenzo, Makati
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {report.category}
                </div>
              </div>
            </div>

            {report.photoUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-[40px] border border-zinc-100 bg-zinc-50 shadow-xl">
                <img src={report.photoUrl} alt={report.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</h2>
              <p className="text-xl text-zinc-600 leading-relaxed">{report.description}</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Exact Location</h2>
              <div className="h-[400px] overflow-hidden rounded-[40px] border border-zinc-100 bg-zinc-50 shadow-inner">
                <MapContainer center={[report.location.lat, report.location.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[report.location.lat, report.location.lng]} />
                </MapContainer>
              </div>
              <p className="text-sm text-zinc-400 italic">Coordinates: {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="rounded-[40px] border border-zinc-100 bg-zinc-50 p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700 text-white shadow-lg shadow-red-900/20">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Activity Log</h3>
              </div>

              <div className="space-y-8">
                {logs.map((log, idx) => (
                  <div key={log.id} className="relative flex gap-6">
                    {idx !== logs.length - 1 && (
                      <div className="absolute left-[11px] top-8 h-full w-[2px] bg-zinc-200" />
                    )}
                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-red-700 shadow-sm" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">{log.toStatus}</span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {log.timestamp?.toDate ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed">{log.note}</p>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">By {log.changedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[40px] bg-red-700 p-10 text-white shadow-2xl shadow-red-900/20 space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Verified Request.</h3>
                <p className="text-sm text-red-100 leading-relaxed">This report has been geotagged and timestamped. Our Barangay San Lorenzo response team is monitoring this issue.</p>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-200">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-200" />
                  Active Monitoring
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
