import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Building2,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Send,
  X,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';

interface SharePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharePortalModal: React.FC<SharePortalModalProps> = ({ isOpen, onClose }) => {
  const { switchUser, currentUser } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'labs' | 'phlebos' | 'tracking'>('labs');

  if (!isOpen) return null;

  const currentBaseUrl = window.location.origin + window.location.pathname;

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getRoleUrl = (roleParam: string) => {
    return `${currentBaseUrl}?portal=${encodeURIComponent(roleParam)}`;
  };

  const labUsers = DEMO_USERS.filter(u => u.role === 'lab');
  const phleboUsers = DEMO_USERS.filter(u => u.role === 'phlebotomist');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Share Direct Access Links</h2>
              <p className="text-xs text-slate-400">
                Send dedicated portal links to your partner Labs, Phlebotomists, or Patients
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
              activeTab === 'labs'
                ? 'bg-white text-emerald-700 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Diagnostic Labs (Clients)</span>
          </button>

          <button
            onClick={() => setActiveTab('phlebos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
              activeTab === 'phlebos'
                ? 'bg-white text-teal-700 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Phlebotomist Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
              activeTab === 'tracking'
                ? 'bg-white text-blue-700 border-slate-200 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Live Patient Tracking</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Diagnostic Labs Section */}
          {activeTab === 'labs' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 text-xs text-emerald-900">
                <p className="font-semibold mb-1">🏥 Diagnostic Lab Direct Portals</p>
                <p className="text-emerald-800/80 mb-2">
                  Each link pre-selects the client's private workspace. Clients enter their PIN / Password to authenticate.
                </p>
                <div className="inline-block bg-white/80 border border-emerald-300 px-2 py-1 rounded text-[11px] font-mono font-bold text-emerald-900">
                  Default Demo Access: PIN "1234" or Password "password123"
                </div>
              </div>

              {labUsers.map(lab => {
                const link = getRoleUrl(lab.id);
                const isCopied = copiedId === lab.id;

                return (
                  <div
                    key={lab.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {lab.labId?.replace('LAB-', '') || 'L'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{lab.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Tenant ID: {lab.labId} • {lab.email}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          switchUser(lab.id);
                          onClose();
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                      >
                        <span>Preview as Lab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        readOnly
                        value={link}
                        className="flex-1 bg-transparent text-xs text-slate-700 font-mono outline-hidden select-all"
                      />
                      <button
                        onClick={() => handleCopy(link, lab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phlebotomists Section */}
          {activeTab === 'phlebos' && (
            <div className="space-y-3">
              <div className="bg-teal-50 border border-teal-200/60 rounded-2xl p-4 text-xs text-teal-900">
                <p className="font-semibold mb-1">🛵 Phlebotomist Mobile Workspaces</p>
                <p className="text-teal-800/80">
                  Share these mobile-optimized links directly via WhatsApp/SMS to your on-duty phlebotomists for sample scanning, GPS routing, cold-box temp entry, and OTP collection.
                </p>
              </div>

              {phleboUsers.map(phlebo => {
                const link = getRoleUrl(phlebo.id);
                const isCopied = copiedId === phlebo.id;
                const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
                  `Hello ${phlebo.name}, here is your SwiftPhlebo duty link: ${link}`
                )}`;

                return (
                  <div
                    key={phlebo.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                          {phlebo.phlebotomistId?.replace('PHL-', 'P') || 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{phlebo.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {phlebo.phlebotomistId} • {phlebo.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={whatsappShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => {
                            switchUser(phlebo.id);
                            onClose();
                          }}
                          className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center space-x-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        readOnly
                        value={link}
                        className="flex-1 bg-transparent text-xs text-slate-700 font-mono outline-hidden select-all"
                      />
                      <button
                        onClick={() => handleCopy(link, phlebo.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          isCopied
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Patient Tracking Section */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 text-xs text-blue-900">
                <p className="font-semibold mb-1">📍 Public Patient Tracking Link</p>
                <p className="text-blue-800/80">
                  Patients receive real-time phlebotomist ETA, cold box temperature compliance, and vial collection updates without needing to sign in.
                </p>
              </div>

              {['SWP-A01', 'SWP-A02', 'SWP-B01'].map(orderId => {
                const trackLink = `${currentBaseUrl}?track=${encodeURIComponent(orderId)}`;
                const isCopied = copiedId === orderId;

                return (
                  <div
                    key={orderId}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                          #
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">Sample Order #{orderId}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Live GPS Tracking & Cold Box Temp</div>
                        </div>
                      </div>

                      <a
                        href={trackLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
                      >
                        <span>Test Track</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        readOnly
                        value={trackLink}
                        className="flex-1 bg-transparent text-xs text-slate-700 font-mono outline-hidden select-all"
                      />
                      <button
                        onClick={() => handleCopy(trackLink, orderId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          isCopied
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Links work instantly on mobile and desktop without password prompts</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
