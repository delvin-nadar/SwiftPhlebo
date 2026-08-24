import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Activity,
  ShieldCheck,
  Building2,
  UserCheck,
  Search,
  MapPin,
  RefreshCw,
  Lock,
  ChevronDown,
  Sparkles,
  Share2
} from 'lucide-react';

interface HeaderProps {
  onOpenSecurityModal: () => void;
  onOpenTrackModal: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSecurityModal,
  onOpenTrackModal,
  onOpenShareModal
}) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    switchUser,
    demoUsers,
    phlebotomists,
    orders,
    resetToDefaultData
  } = useApp();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const onDutyCount = phlebotomists.filter(p => p.onDuty).length;

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & City */}
            <div className="flex items-center space-x-3">
              <div
                id="brand-logo"
                className="flex items-center space-x-2.5 cursor-pointer"
                onClick={() => switchRole('lab')}
              >
                <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-tight">
                  <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-lg tracking-tight text-white">
                      Swift<span className="text-emerald-400">Phlebo</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      Vizag
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Diagnostic Phlebotomist Fulfillment Network
                  </p>
                </div>
              </div>

              {/* City & Multi-Tenant Status */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/90 text-xs text-slate-300 border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Visakhapatnam</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-slate-400 font-mono">({onDutyCount} Phlebos On-Duty)</span>
              </div>
            </div>

            {/* Role Switcher Tabs (Lab / Phlebo / Admin) */}
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
              
              {/* Lab Portal */}
              <button
                id="role-lab-btn"
                onClick={() => switchRole('lab')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'lab'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lab Portal</span>
              </button>

              {/* Phlebotomist Portal */}
              <button
                id="role-phlebo-btn"
                onClick={() => switchRole('phlebotomist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'phlebotomist'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Phlebotomist</span>
              </button>

              {/* Admin Portal */}
              <button
                id="role-admin-btn"
                onClick={() => switchRole('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-slate-800 text-amber-400 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Ops</span>
              </button>
            </div>

            {/* Right-Side Actions: Quick Tenant Switcher & Security Verifier */}
            <div className="flex items-center space-x-2">
              
              {/* Quick Tenant Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="max-w-[110px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showTenantDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      Switch Authenticated Identity:
                    </div>

                    <div className="space-y-1 py-1">
                      {demoUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowTenantDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                            currentUser.id === u.id
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-[10px] opacity-75 font-mono">
                              {u.role.toUpperCase()} {u.labId ? `• ${u.labId}` : u.phlebotomistId ? `• ${u.phlebotomistId}` : ''}
                            </div>
                          </div>
                          {currentUser.id === u.id && <span className="text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Share Portals Button */}
              <button
                id="share-portals-btn"
                onClick={onOpenShareModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
                title="Get shareable links for Diagnostic Labs (Clients) and Phlebotomists"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Share Links</span>
              </button>

              {/* Security & Authorization Verifier Button */}
              <button
                id="security-verifier-btn"
                onClick={onOpenSecurityModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                title="Run Backend Security & Authorization Isolation Test Suite"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Security Audit</span>
              </button>

              <button
                id="reset-data-btn"
                onClick={resetToDefaultData}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset Database to Clean Multi-Tenant State"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};
