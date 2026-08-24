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
  LogOut,
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
    logout,
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
                className="flex items-center space-x-2.5"
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

            {/* Authenticated Tenant Badge / Role Lock Indicator */}
            {currentRole === 'lab' && (
              <div className="flex items-center space-x-2 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-2xl">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-200">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-400/80 font-mono font-semibold">
                    Tenant Partition: {currentUser.labId} • Private Workspace
                  </div>
                </div>
              </div>
            )}

            {currentRole === 'phlebotomist' && (
              <div className="flex items-center space-x-2 bg-teal-950/70 border border-teal-500/40 px-3 py-1.5 rounded-2xl">
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-teal-200">{currentUser.name}</div>
                  <div className="text-[10px] text-teal-400/80 font-mono font-semibold">
                    Phlebotomist ID: {currentUser.phlebotomistId} • Mobile Task Console
                  </div>
                </div>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center space-x-2 bg-amber-950/70 border border-amber-500/40 px-3 py-1.5 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-200">Vizag Central Operations</div>
                  <div className="text-[10px] text-amber-400/80 font-mono font-semibold">
                    Super Admin Dispatch & Governance
                  </div>
                </div>
              </div>
            )}

            {/* Right-Side Actions: Share, Security Audit & Logout */}
            <div className="flex items-center space-x-2">
              
              {/* Only Central Operations Admin has developer inspection switcher */}
              {currentRole === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="max-w-[110px] truncate">Admin Switcher</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showTenantDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in">
                      <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                        Admin Impersonation / Inspection:
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
                                ? 'bg-amber-600 text-white font-bold'
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
              )}

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

              {/* Secure Log Out Button */}
              <button
                id="logout-btn"
                onClick={logout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-300 hover:border-red-800 border border-slate-700 text-xs font-bold text-slate-300 transition-all shadow-sm"
                title="Lock session & Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};
