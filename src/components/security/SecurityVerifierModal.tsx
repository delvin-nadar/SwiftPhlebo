import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityTestResult } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Terminal,
  Server,
  KeyRound,
  X,
  Send
} from 'lucide-react';

interface SecurityVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityVerifierModal: React.FC<SecurityVerifierModalProps> = ({ isOpen, onClose }) => {
  const { runSecurityTestSuite, testTamperAccess, demoUsers } = useApp();
  
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'automated' | 'tamper_playground'>('automated');

  // Custom Tamper State
  const [selectedActorUserId, setSelectedActorUserId] = useState<string>('user-lab-a');
  const [targetOrderId, setTargetOrderId] = useState<string>('SWP-B01');
  const [tamperResponse, setTamperResponse] = useState<{ statusCode: number; payload: any } | null>(null);
  const [isTampering, setIsTampering] = useState(false);

  const executeTestSuite = async () => {
    setIsRunning(true);
    try {
      const data = await runSecurityTestSuite();
      setTestResults(data.results || []);
      setAllPassed(data.allPassed);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && testResults.length === 0) {
      executeTestSuite();
    }
  }, [isOpen]);

  const handleTamperTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const actor = demoUsers.find(u => u.id === selectedActorUserId) || demoUsers[0];
    setIsTampering(true);
    try {
      const res = await testTamperAccess(actor.token, targetOrderId);
      setTamperResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTampering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">
                  Multi-Tenant Security & Authorization Verifier
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-emerald-500 text-slate-950 rounded-full tracking-wider">
                  Backend Enforced
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic isolation between Lab A, Lab B, Lab C, and individual Phlebotomists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('automated')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'automated'
                  ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Automated 5-Point Test Suite</span>
            </button>
            <button
              onClick={() => setActiveTab('tamper_playground')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'tamper_playground'
                  ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Interactive Tamper Playground</span>
            </button>
          </div>

          {activeTab === 'automated' && (
            <button
              onClick={executeTestSuite}
              disabled={isRunning}
              className="mb-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executing Tests...' : 'Re-run All Tests'}</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50 space-y-6">
          
          {activeTab === 'automated' && (
            <div className="space-y-6">
              {/* Summary Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                allPassed === true
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : allPassed === false
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  {allPassed === true ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm">
                      {allPassed === true
                        ? 'All 5 Security Authorization Tests PASSED Successfully!'
                        : isRunning
                        ? 'Running backend authorization verification...'
                        : 'Security Test Status'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      Backend authorization guarantees zero data leakage across distinct lab tenants and individual phlebotomists.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black font-mono">
                    {testResults.filter(t => t.passed).length} / {testResults.length}
                  </span>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Passed
                  </div>
                </div>
              </div>

              {/* Individual Test Cards */}
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {test.passed ? 'PASS' : 'FAIL'}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900">{test.testName}</h5>
                        </div>
                        <p className="text-xs text-slate-600">{test.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <span className="text-slate-400">Expected: {test.expectedStatus}</span>
                        <span className="text-slate-300">|</span>
                        <span className={`font-bold px-2 py-0.5 rounded-lg ${
                          test.actualStatus === 403
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : test.actualStatus === 200
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          HTTP {test.actualStatus} {test.actualStatus === 403 ? 'Forbidden' : 'OK'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Context:</span>
                        <span className="font-bold text-slate-800">{test.authenticatedAs}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Operation:</span>
                        <span className="font-bold text-teal-800">{test.targetResource}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <strong>Assertion Outcome:</strong> {test.details}
                    </div>

                    {test.responsePayloadPreview && (
                      <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                        <span className="text-slate-400 text-[10px] block font-bold uppercase">Backend HTTP Response Payload:</span>
                        <pre className="text-teal-300">{JSON.stringify(test.responsePayloadPreview, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tamper_playground' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
                <strong className="flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Manual Authorization & ID Tampering Simulator</span>
                </strong>
                <p>
                  Test that manually changing an Order ID in an API request across Lab A, Lab B, Lab C, or Phlebotomists is strictly rejected by the server with <strong>HTTP 403 Forbidden</strong> and zero data disclosure.
                </p>
              </div>

              <form onSubmit={handleTamperTest} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Choose Authenticated Session / Identity
                    </label>
                    <select
                      value={selectedActorUserId}
                      onChange={e => setSelectedActorUserId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 bg-white"
                    >
                      {demoUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} [{u.role.toUpperCase()}{u.labId ? `: ${u.labId}` : u.phlebotomistId ? `: ${u.phlebotomistId}` : ''}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Target Order ID to Query
                    </label>
                    <input
                      type="text"
                      value={targetOrderId}
                      onChange={e => setTargetOrderId(e.target.value.toUpperCase())}
                      placeholder="e.g. SWP-B01, SWP-A01, SWP-C01"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 uppercase"
                    />
                  </div>
                </div>

                {/* Quick pre-set attack buttons */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block">Pre-configured Tamper Tests:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActorUserId('user-lab-a');
                        setTargetOrderId('SWP-B01');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-800"
                    >
                      Lab A accessing Lab B order (SWP-B01)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActorUserId('user-phlebo-1');
                        setTargetOrderId('SWP-B01');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-800"
                    >
                      Phlebo 1 accessing Phlebo 2 order (SWP-B01)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActorUserId('user-lab-a');
                        setTargetOrderId('SWP-A01');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-800"
                    >
                      Lab A accessing own order (SWP-A01) [Legitimate]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActorUserId('user-admin');
                        setTargetOrderId('SWP-B01');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-800"
                    >
                      Admin accessing Lab B order (SWP-B01) [Authorized]
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isTampering}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTampering ? 'Querying API...' : 'Dispatch GET /api/orders/:id Request'}</span>
                  </button>
                </div>
              </form>

              {/* Tamper Result */}
              {tamperResponse && (
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    tamperResponse.statusCode === 403
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : tamperResponse.statusCode === 200
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5" />
                      <div>
                        <h4 className="font-extrabold text-sm">
                          HTTP Status {tamperResponse.statusCode} {tamperResponse.statusCode === 403 ? '— Forbidden (Security Guard Succeeded)' : tamperResponse.statusCode === 200 ? '— OK (Authorized)' : ''}
                        </h4>
                        <p className="text-xs opacity-80 mt-0.5">
                          {tamperResponse.statusCode === 403
                            ? 'Server rejected foreign tenant request. No patient name, phone, address, or vial data was exposed.'
                            : 'Server returned authorized payload.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
                    <div className="text-slate-400 flex items-center space-x-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <span>Live Server Response:</span>
                    </div>
                    <pre className="text-teal-300">{JSON.stringify(tamperResponse.payload, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
