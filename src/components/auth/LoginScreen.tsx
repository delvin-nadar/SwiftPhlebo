import React, { useState, useEffect } from 'react';
import {
  Activity,
  Lock,
  Building2,
  UserCheck,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  CheckCircle2
} from 'lucide-react';
import { DEMO_USERS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { loginWithPassword } = useApp();

  // Selected portal category
  const [activeCategory, setActiveCategory] = useState<'lab' | 'phlebotomist' | 'admin'>('lab');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lockedTenantLabel, setLockedTenantLabel] = useState<string | null>(null);

  // Auto-detect portal target from URL parameters without leaking competitor names
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const portalParam = urlParams.get('portal') || urlParams.get('user') || urlParams.get('role');
      if (portalParam) {
        const found = DEMO_USERS.find(
          u =>
            u.id === portalParam ||
            u.role === portalParam ||
            u.labId?.toLowerCase() === portalParam.toLowerCase() ||
            u.phlebotomistId?.toLowerCase() === portalParam.toLowerCase() ||
            u.email.toLowerCase() === portalParam.toLowerCase()
        );
        if (found) {
          setActiveCategory(found.role);
          if (found.role === 'lab') {
            setIdentifier(found.labId || found.email);
            setLockedTenantLabel(`Dedicated Portal: ${found.labId}`);
          } else if (found.role === 'phlebotomist') {
            setIdentifier(found.phlebotomistId || found.email);
            setLockedTenantLabel(`Duty Link: ${found.phlebotomistId}`);
          } else {
            setIdentifier(found.email);
          }
          setPassword('password123');
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default identifier placeholder based on initial category
    setIdentifier('LAB-A');
  }, []);

  const handleCategoryChange = (category: 'lab' | 'phlebotomist' | 'admin') => {
    setActiveCategory(category);
    setError(null);
    setLockedTenantLabel(null);
    if (category === 'lab') {
      setIdentifier('LAB-A');
    } else if (category === 'phlebotomist') {
      setIdentifier('PHL-1');
    } else {
      setIdentifier('admin@swiftphlebo.in');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!identifier.trim()) {
      setError('Please enter your Tenant ID, Phlebotomist ID, or Email');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await loginWithPassword(identifier.trim(), password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials or PIN. Use "password123" or PIN "1234"');
      }
    } catch {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="text-center mb-6 z-10">
        <div className="inline-flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 text-slate-950 font-black">
            <Activity className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Swift<span className="text-emerald-400">Phlebo</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                VIZAG
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Tenant Diagnostic Fulfillment Network</p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
        
        {/* Top Banner */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>Secure Tenant Partition & Login</span>
          </div>
          <span className="text-[11px] font-mono bg-slate-900/90 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700">
            Zero-Knowledge Isolated
          </span>
        </div>

        {/* Portal Category Selector */}
        <div className="p-6 pb-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Portal Access:
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Diagnostic Lab Tab */}
            <button
              type="button"
              onClick={() => handleCategoryChange('lab')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                activeCategory === 'lab'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Building2 className={`w-5 h-5 mb-1.5 ${activeCategory === 'lab' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="font-bold text-xs">Diagnostic Lab</div>
              <div className="text-[10px] opacity-75">Partner Client</div>
            </button>

            {/* Phlebotomist Tab */}
            <button
              type="button"
              onClick={() => handleCategoryChange('phlebotomist')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                activeCategory === 'phlebotomist'
                  ? 'bg-teal-950/60 border-teal-500 text-white shadow-lg shadow-teal-950/50'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <UserCheck className={`w-5 h-5 mb-1.5 ${activeCategory === 'phlebotomist' ? 'text-teal-400' : 'text-slate-400'}`} />
              <div className="font-bold text-xs">Phlebotomist</div>
              <div className="text-[10px] opacity-75">Duty Console</div>
            </button>

            {/* Central Admin Tab */}
            <button
              type="button"
              onClick={() => handleCategoryChange('admin')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                activeCategory === 'admin'
                  ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 mb-1.5 ${activeCategory === 'admin' ? 'text-amber-400' : 'text-slate-400'}`} />
              <div className="font-bold text-xs">Central Ops</div>
              <div className="text-[10px] opacity-75">Supervision</div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          
          {/* Direct Link Locked Indicator (if accessed via direct URL) */}
          {lockedTenantLabel && (
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{lockedTenantLabel}</span>
            </div>
          )}

          {/* Identifier Input (Tenant Code / Phlebo ID / Email) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {activeCategory === 'lab'
                  ? 'Partner Lab Tenant ID or Email:'
                  : activeCategory === 'phlebotomist'
                  ? 'Phlebotomist ID, Mobile, or Email:'
                  : 'Central Operations Admin Email:'}
              </span>
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={e => {
                setIdentifier(e.target.value);
                setError(null);
              }}
              placeholder={
                activeCategory === 'lab'
                  ? 'e.g. LAB-A or your lab email'
                  : activeCategory === 'phlebotomist'
                  ? 'e.g. PHL-1 or registered phone'
                  : 'admin@swiftphlebo.in'
              }
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Password / PIN Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Password / Access PIN:</span>
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password or PIN..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center space-x-2 shadow-lg ${
              activeCategory === 'lab'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                : activeCategory === 'phlebotomist'
                ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/40'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
            }`}
          >
            <span>Authenticate & Access Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security & Confidentiality Footer */}
        <div className="bg-slate-950/90 px-6 py-3.5 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Tenant Privacy Guaranteed</span>
            </span>
            <span className="font-mono text-[10px]">HIPAA & NABL Standard</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Partner diagnostic lab names and technician rosters are strictly concealed. Each tenant only sees their own scoped records.
          </p>
        </div>

      </div>

    </div>
  );
};
