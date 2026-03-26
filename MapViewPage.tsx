import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import StatusBadge, { ReportStatus } from '../components/StatusBadge';
import { cn } from '../lib/utils';

// Fix for default marker icon in Leaflet + Vite
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case 'Submitted': return '#71717a'; // zinc-500
    case 'Under Review': return '#eab308'; // yellow-500
    case 'In Progress': return '#3b82f6'; // blue-500
    case 'Resolved': return '#22c55e'; // green-500
    default: return '#71717a';
  }
};

export default function MapViewPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'));
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Global Report Map</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-zinc-500" /> Submitted</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-yellow-500" /> Review</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500" /> Progress</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500" /> Resolved</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MapContainer center={[14.5500, 121.0175]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.location.lat, report.location.lng]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${getStatusColor(report.status)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup className="custom-popup">
                <div className="p-2 space-y-3 min-w-[200px]">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-zinc-900">{report.title}</h3>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">{report.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      report.urgency === 'High' ? 'text-red-500' : report.urgency === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                    )}>
                      {report.urgency} Urgency
                    </div>
                    <Link 
                      to={`/report/${report.id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
