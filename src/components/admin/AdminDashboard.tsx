import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveOrderBoard } from './LiveOrderBoard';
import { CapacitySlotHeatmap } from './CapacitySlotHeatmap';
import { PhlebotomistRoster } from './PhlebotomistRoster';
import { LabManagement } from './LabManagement';
import { ZoneManagement } from './ZoneManagement';
import { PayoutsManagement } from './PayoutsManagement';
import { AnalyticsPanel } from './AnalyticsPanel';
import {
  Kanban,
  Flame,
  Users,
  Building2,
  MapPin,
  Banknote,
  TrendingUp,
  ShieldCheck,
  Play,
  CheckCircle2,
  XCircle,
  KeyRound,
  Terminal,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';
import { SecurityTestResult } from '../../types';

interface AdminDashboardProps {
  onOpenSecurityModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenSecurityModal }) => {
  const {
    orders,
    phlebotomists,
    labs,
    zones,
    runSecurityTestSuite,
    testTamperAccess,
    demoUsers
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'capacity' | 'phlebotomists' | 'labs' | 'zones' | 'payouts' | 'security'
  >('orders');

  const [isTesting, setIsTesting] = useState(false);
  const [securityResults, setSecurityResults] = useState<SecurityTestResult[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  const onDutyCount = phlebotomists.filter(p => p.onDuty).length;
  const activeOrdersCount = orders.filter(
    o => o.status !== 'Handed to Lab' && o.status !== 'Cancelled'
  ).length;

  const handleRunSecurityTests = async () => {
    setIsTesting(true);
    try {
      const data = await runSecurityTestSuite();
      setSecurityResults(data.results || []);
      setAllPassed(data.allPassed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Live Orders Supervision', icon: Kanban, badge: activeOrdersCount },
    { id: 'capacity', label: '06:00-11:00 Slot Capacity', icon: Flame },
    { id: 'phlebotomists', label: 'Phlebotomist Fleet', icon: Users, badge: `${onDutyCount} on duty` },
    { id: 'labs', label: 'Partner Labs (Lab A, B, C)', icon: Building2, badge: labs.length },
    { id: 'zones', label: 'Vizag Zones', icon: MapPin, badge: zones.length },
    { id: 'payouts', label: 'Technician Payouts', icon: Banknote },
    { id: 'security', label: 'Security & Tenant Isolation', icon: ShieldCheck, badge: '5 Tests' }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner with Quick Summary */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              SwiftPhlebo Central Operations Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Global Dispatch & Multi-Tenant Supervision
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central orchestration across Lab A, Lab B, Lab C, and all Vizag phlebotomists
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">On-Duty Fleet: </span>
            <strong className="text-emerald-400">{onDutyCount} / {phlebotomists.length}</strong>
          </div>

          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Active Orders: </span>
            <strong className="text-amber-400">{activeOrdersCount}</strong>
          </div>

          <button
            onClick={() => {
              setActiveTab('security');
              handleRunSecurityTests();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Run Security Audit</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && <LiveOrderBoard />}
      {activeTab === 'capacity' && <CapacitySlotHeatmap />}
      {activeTab === 'phlebotomists' && <PhlebotomistRoster />}
      {activeTab === 'labs' && <LabManagement />}
      {activeTab === 'zones' && <ZoneManagement />}
      {activeTab === 'payouts' && <PayoutsManagement />}

      {/* SECURITY & TENANT ISOLATION TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Backend Multi-Tenant Authorization Test Suite</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verifies strict tenant partition enforcement across Lab A, Lab B, Phlebotomist 1, 2, and Admin at the API layer.
              </p>
            </div>

            <button
              onClick={handleRunSecurityTests}
              disabled={isTesting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-xs transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Running Security Tests...' : 'Execute All 5 Security Tests'}</span>
            </button>
          </div>

          {securityResults.length > 0 && (
            <div className="space-y-4">
              {/* Overall status */}
              <div className={`p-5 rounded-3xl border flex items-center justify-between ${
                allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-sm">
                      {allPassed ? 'All 5 Authorization & Tenant Isolation Checks Passed!' : 'Authorization Checks Failed'}
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5">
                      Backend guarantees zero cross-tenant order leakage and returns HTTP 403 on ID tampering.
                    </p>
                  </div>
                </div>
                <div className="font-mono text-xl font-black">
                  {securityResults.filter(r => r.passed).length} / {securityResults.length} PASSED
                </div>
              </div>

              {/* Individual Tests */}
              <div className="grid grid-cols-1 gap-4">
                {securityResults.map(test => (
                  <div key={test.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {test.passed ? 'PASS' : 'FAIL'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{test.testName}</h4>
                      </div>

                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="text-slate-400">Expected: {test.expectedStatus}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          Actual: HTTP {test.actualStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Caller Session:</span>
                        <span className="font-bold text-slate-800">{test.authenticatedAs}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Target API Endpoint:</span>
                        <span className="font-bold text-teal-800">{test.targetResource}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                      <strong>Assertion:</strong> {test.details}
                    </p>

                    {test.responsePayloadPreview && (
                      <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                        <span className="text-slate-400 text-[10px] block font-bold uppercase mb-1">Server Response Payload:</span>
                        <pre className="text-teal-300">{JSON.stringify(test.responsePayloadPreview, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
