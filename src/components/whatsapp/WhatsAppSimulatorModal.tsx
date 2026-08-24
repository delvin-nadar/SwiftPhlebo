import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { receiveWhatsAppWebhook } from '../../utils/whatsappService';
import {
  MessageSquare,
  X,
  Send,
  CheckCheck,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Terminal
} from 'lucide-react';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { whatsappLogs, orders } = useApp();
  const [activeTab, setActiveTab] = useState<'feed' | 'simulate_inbound' | 'api_docs'>('feed');

  // Inbound webhook testing state
  const [inboundFrom, setInboundFrom] = useState('+919849155210');
  const [inboundText, setInboundText] = useState('STATUS');
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSendInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundText) return;

    const payload = {
      from: inboundFrom,
      message: inboundText,
      message_id: `WA-IN-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const res = receiveWhatsAppWebhook(payload);
    setWebhookResult(JSON.stringify(res, null, 2));
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  WhatsApp Gateway Sandbox (Authkey.io)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-400 text-emerald-950 rounded-full">
                  Live Simulator
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Inspect triggered patient alerts and simulate inbound WhatsApp customer webhooks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Outbound Alerts Log ({whatsappLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('simulate_inbound')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeTab === 'simulate_inbound'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Test Inbound Webhook
          </button>
          <button
            onClick={() => setActiveTab('api_docs')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
              activeTab === 'api_docs'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Authkey.io API Docs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {/* Tab 1: Outbound Alerts Log */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {whatsappLogs.length > 0 ? (
                whatsappLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {log.eventType}
                        </span>
                        <span className="font-mono text-slate-700 font-bold">
                          To: {log.recipientPhone}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* WhatsApp Chat Bubble lookalike */}
                    <div className="bg-[#E7FFDB] p-3.5 rounded-2xl rounded-tl-none border border-[#C2E8A9] text-xs text-slate-900 font-mono whitespace-pre-line leading-relaxed shadow-xs relative">
                      {log.messageText}
                      <div className="flex items-center justify-end space-x-1 mt-2 text-[10px] text-slate-400">
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Template: <code className="text-emerald-700 font-bold">{log.templateName}</code></span>
                      <button
                        onClick={() => copyToClipboard(log.messageText, idx)}
                        className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No WhatsApp events fired yet. Place a booking or advance a status to see real-time alerts!
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Test Inbound Webhook */}
          {activeTab === 'simulate_inbound' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950">
                <strong>Simulate Inbound WhatsApp User Reply:</strong>
                <p className="mt-1">
                  When a patient texts your WhatsApp Business Number, Authkey.io sends a POST webhook to our endpoint. Test keyword parsing below.
                </p>
              </div>

              <form onSubmit={handleSendInbound} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Mobile Phone</label>
                  <input
                    type="text"
                    value={inboundFrom}
                    onChange={e => setInboundFrom(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inbound Message Text / Keyword</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inboundText}
                      onChange={e => setInboundText(e.target.value)}
                      placeholder="e.g. STATUS, CANCEL, WHERE IS MY PHLEBOTOMIST"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shrink-0 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simulate Webhook</span>
                    </button>
                  </div>
                </div>

                {/* Quick test buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] text-slate-400 font-bold">Quick test prompts:</span>
                  {['STATUS', 'CONFIRM', 'CANCEL SWP-8921', 'CALL ME', 'HELP'].map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInboundText(prompt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </form>

              {webhookResult && (
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
                  <div className="text-slate-400 flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-teal-400" />
                    <span>Authkey Webhook Handler Execution Response:</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{webhookResult}</pre>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: API Docs */}
          {activeTab === 'api_docs' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs text-slate-700">
              <h4 className="font-bold text-sm text-slate-900">Authkey.io WhatsApp API Integration Spec</h4>
              <p>
                SwiftPhlebo utilizes Authkey.io REST endpoints to deliver template-approved WhatsApp messages across Andhra Pradesh.
              </p>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-emerald-400">// Sample Endpoint Configuration</div>
                <div>POST https://api.authkey.io/request?authkey=AUTHKEY_API_KEY</div>
                <div>Headers: Content-Type: application/json</div>
                <div className="text-slate-400 pt-2">Payload Schema:</div>
                <pre className="text-teal-300">
{`{
  "country_code": "91",
  "mobile": "9848012345",
  "template_id": "swiftphlebo_slot_confirmed",
  "variables": {
    "patient_name": "Ramesh Chandra",
    "lab_name": "Vijaya Diagnostics Vizag",
    "slot": "07:00 - 08:00 AM",
    "phlebo_name": "Suresh Naidu (DMLT)",
    "tracking_url": "https://swiftphlebo.in/track/SWP-8921"
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
