import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lab } from '../../types';
import {
  Building2,
  Plus,
  Edit,
  TrendingUp,
  Award,
  CheckCircle2,
  Percent,
  Search,
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react';

export const LabManagement: React.FC = () => {
  const { labs, addLab, updateLab } = useApp();
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);

  // New Lab Form State
  const [newLabName, setNewLabName] = useState('');
  const [newLabAddress, setNewLabAddress] = useState('');
  const [newLabLocality, setNewLabLocality] = useState('');
  const [newLabPhone, setNewLabPhone] = useState('+91 891 ');
  const [newLabCommission, setNewLabCommission] = useState(0.15);
  const [newLabBadge, setNewLabBadge] = useState('NABL Accredited');

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName) return;

    addLab({
      name: newLabName,
      badge: newLabBadge,
      code: `LAB-${newLabName.slice(0, 3).toUpperCase()}`,
      email: `${newLabName.toLowerCase().replace(/\s+/g, '')}@vizaglab.com`,
      totalOrders: 0,
      address: newLabAddress,
      locality: newLabLocality || 'Visakhapatnam',
      phone: newLabPhone,
      status: 'active',
      rating: 4.8
    });

    setShowAddLabModal(false);
    setNewLabName('');
    setNewLabAddress('');
    setNewLabLocality('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Partner Diagnostic Labs (Isolated Multi-Tenant Accounts)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner laboratory tenants in Visakhapatnam and their fulfillment parameters
          </p>
        </div>

        <button
          onClick={() => setShowAddLabModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Laboratory</span>
        </button>
      </div>

      {/* Labs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labs.map(lab => {
          return (
            <div
              key={lab.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Lab Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{lab.name}</h3>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Tenant ID: {lab.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{lab.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lab.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Accreditation:</span>
                  <span className="font-bold text-teal-800">{lab.badge}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tenant Partitioned</span>
                </span>
                <span className="text-slate-400 font-mono">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lab Modal */}
      {showAddLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Onboard Diagnostic Lab</h3>
              <button
                onClick={() => setShowAddLabModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLab} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Laboratory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Care Diagnostic Central Lab"
                  value={newLabName}
                  onChange={e => setNewLabName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waltair Main Road, Visakhapatnam"
                  value={newLabAddress}
                  onChange={e => setNewLabAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={newLabPhone}
                  onChange={e => setNewLabPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLabModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Onboard Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
