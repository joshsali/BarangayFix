import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileText, MapPin, Sparkles, Zap, Users, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-red-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Micro-label */}
          <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-700">
            <Sparkles className="h-3 w-3" />
            Official Platform for Barangay San Lorenzo
          </div>

          {/* Professional Headline */}
          <h1 className="max-w-4xl font-sans text-6xl font-black leading-[0.95] tracking-tight text-zinc-900 sm:text-8xl lg:text-9xl">
            BETTER <span className="text-zinc-400">COMMUNITY</span> THROUGH <span className="text-red-700">AI</span>.
          </h1>

          <p className="max-w-2xl text-lg font-medium text-zinc-600 sm:text-xl">
            BarangayFix empowers the residents of San Lorenzo, Makati to report infrastructure issues 
            instantly. Our AI-driven system ensures every pothole, broken light, and waste problem is 
            categorized and resolved with precision.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link 
              to="/dashboard"
              className="group flex items-center justify-center gap-3 rounded-2xl bg-red-700 px-8 py-5 text-lg font-bold text-white transition-all hover:bg-red-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20"
            >
              Resident Portal
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/admin"
              className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-8 py-5 text-lg font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
            >
              Official Login
              <ShieldCheck className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-red-600" />}
            title="Instant Reporting"
            description="Submit issues in seconds with photos and precise GPS location. No more long queues at the Barangay Hall."
          />
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6 text-red-600" />}
            title="AI Categorization"
            description="Our AI automatically analyzes your report, assigns urgency, and routes it to the right department."
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6 text-red-600" />}
            title="Real-time Tracking"
            description="Follow the progress of your report from submission to resolution with a live status timeline."
          />
        </div>

        {/* Stats Section */}
        <div className="mt-32 rounded-[40px] border border-zinc-100 bg-zinc-50 p-12">
          <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
            <StatItem label="Active Residents" value="2,450+" />
            <StatItem label="Issues Resolved" value="1,200+" />
            <StatItem label="Avg Response" value="4.5 hrs" />
            <StatItem label="Satisfaction" value="98%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-3xl border border-zinc-100 bg-white p-8 transition-all hover:border-red-100 hover:bg-red-50/30">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 group-hover:bg-red-100 transition-colors">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-zinc-900">{title}</h3>
      <p className="text-zinc-500">{description}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="text-4xl font-black text-zinc-900">{value}</span>
    </div>
  );
}
