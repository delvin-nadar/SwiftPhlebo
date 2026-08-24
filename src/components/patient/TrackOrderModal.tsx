import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, CheckCircle2, Clock, Bike, ArrowRight } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder
}) => {
  const { orders } = useApp();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    const matched = orders.find(
      o => o.id.toUpperCase() === clean || o.patientPhone.includes(clean)
    );

    if (matched) {
      onSelectOrder(matched.id);
      onClose();
    } else {
      setError(`No active booking found for "${query}". Try SWP-8921 or SWP-8922.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">Track Sample Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Enter Order ID or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setError('');
                }}
                placeholder="e.g. SWP-8921 or 9849155210"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
          </div>

          {/* Quick Active Bookings in Demo */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Recent Vizag Bookings (Click to Track):
            </div>
            <div className="space-y-2">
              {orders.slice(0, 3).map(o => (
                <div
                  key={o.id}
                  onClick={() => {
                    onSelectOrder(o.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>#{o.id}</span>
                      <span className="text-slate-500 font-normal">• {o.patientName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {o.locality} • {o.labName}
                    </div>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
            >
              Track Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
