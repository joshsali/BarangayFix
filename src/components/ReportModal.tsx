import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Camera, Loader2, Sparkles, AlertTriangle, Info, FileText } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeReport, AIAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';

// Fix for default marker icon in Leaflet + Vite
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function ReportModal({ isOpen, onClose, onSuccess }: ReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High">('Low');
  const [photo, setPhoto] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number]>([14.5500, 121.0175]); // Focused on San Lorenzo, Makati
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeReport(title, description);
      setAiAnalysis(analysis);
      setCategory(analysis.category);
      setUrgency(analysis.urgency);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;
    setIsSubmitting(true);

    try {
      const reportData = {
        title,
        description,
        category,
        urgency,
        status: 'Submitted',
        photoUrl: photo,
        location: {
          lat: position[0],
          lng: position[1],
          address: "Barangay San Lorenzo, Makati City"
        },
        reporterUid: "anonymous-resident",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'reports'), reportData);
      
      await addDoc(collection(db, 'reports', docRef.id, 'logs'), {
        reportId: docRef.id,
        fromStatus: null,
        toStatus: 'Submitted',
        changedBy: 'System',
        timestamp: serverTimestamp(),
        note: 'Report submitted by resident of San Lorenzo.'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-zinc-100 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-50 bg-white/80 p-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-700 shadow-lg shadow-red-900/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">SUBMIT REPORT.</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">San Lorenzo Community Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-zinc-50 p-3 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Report Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pothole on Arnaiz Avenue"
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-zinc-900 placeholder-zinc-300 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible..."
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-zinc-900 placeholder-zinc-300 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !title || !description}
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-8 py-5 text-sm font-black uppercase tracking-widest text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Run AI Analysis
              </button>
            </div>

            {aiAnalysis && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-red-700 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles className="h-4 w-4" />
                  AI Intelligence Report
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed italic">"{aiAnalysis.reasoning}"</p>
                <div className="flex gap-6 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">Category</span>
                    <span className="text-sm font-bold text-zinc-900">{aiAnalysis.category}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">Urgency</span>
                    <span className={cn("text-sm font-black", aiAnalysis.urgency === 'High' ? 'text-red-600' : aiAnalysis.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600')}>{aiAnalysis.urgency}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-zinc-900 outline-none focus:border-red-500 transition-all appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="Road/Pothole">Road/Pothole</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Waste/Garbage">Waste/Garbage</option>
                  <option value="Water/Drainage">Water/Drainage</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Urgency</label>
                <select
                  required
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-zinc-900 outline-none focus:border-red-500 transition-all appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Geotag Location
              </label>
              <div className="h-[400px] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-50 shadow-inner">
                <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4">
                <Info className="h-5 w-5 text-zinc-300 shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  Click on the map to mark the exact spot. Our team uses this Geotag to dispatch maintenance crews directly to the site.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Visual Evidence</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex cursor-pointer items-center justify-center gap-4 rounded-[32px] border-2 border-dashed border-zinc-100 bg-zinc-50 p-12 transition-all hover:border-red-500/30 hover:bg-red-50/30"
                >
                  {photo ? (
                    <div className="relative h-48 w-full">
                      <img src={photo} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                        <Camera className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-300 group-hover:text-zinc-400 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                        <Camera className="h-8 w-8" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Upload Photo Evidence</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-4 rounded-[32px] bg-red-700 p-6 text-xl font-black tracking-tight text-white transition-all hover:bg-red-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-red-900/20 uppercase"
              >
                {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : "SUBMIT REPORT."}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
