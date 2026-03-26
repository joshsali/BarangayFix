import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Resident View', icon: <LayoutDashboard className="h-4 w-4" /> },
    { path: '/map', label: 'Map View', icon: <MapPin className="h-4 w-4" /> },
    { path: '/admin', label: 'Official View', icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-[100] border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700 shadow-lg shadow-red-900/20 transition-transform group-hover:scale-110 group-active:scale-95">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-zinc-900">BarangayFix</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">San Lorenzo, Makati</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
                location.pathname === item.path
                  ? "bg-red-50 text-red-700 shadow-inner"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Trigger (Simplified for now) */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 sm:hidden">
          <LayoutDashboard className="h-5 w-5" />
        </div>
      </div>
    </nav>
  );
}
