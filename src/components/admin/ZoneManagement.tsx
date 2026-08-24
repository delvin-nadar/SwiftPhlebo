import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Zone } from '../../types';
import { MapPin, Plus, Edit, CheckCircle2, Users, AlertCircle, Compass } from 'lucide-react';

export const ZoneManagement: React.FC = () => {
  const { zones, phlebotomists, addZone, updateZone } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // New Zone Form
  const [name, setName] = useState('');
  const [pincodesStr, setPincodesStr] = useState('');
  const [centerLat, setCenterLat] = useState('17.7384');
  const [centerLng, setCenterLng] = useState('83.3374');
  const [bufferMinutes, setBufferMinutes] = useState(20);

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pincodesStr) return;

    const pincodes = pincodesStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    addZone({
      name,
      pincodes,
      centerLat: parseFloat(centerLat) || 17.72,
      centerLng: parseFloat(centerLng) || 83.3,
      bufferMinutes: Number(bufferMinutes) || 20,
      active: true
    });

    setShowAddModal(false);
    setName('');
    setPincodesStr('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    updateZone(editingZone.id, {
      name: editingZone.name,
      pincodes: editingZone.pincodes,
      bufferMinutes: editingZone.bufferMinutes,
      active: editingZone.active
    });
    setEditingZone(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <span>Visakhapatnam Operational Zones & Coverage</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure geographic zones, mapped postal codes, and dispatch travel buffers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Operating Zone</span>
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => {
          const onDutyInZone = phlebotomists.filter(p => p.homeZoneId === zone.id && p.onDuty).length;
          const totalInZone = phlebotomists.filter(p => p.homeZoneId === zone.id).length;

          return (
            <div
              key={zone.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-teal-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{zone.name}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{zone.centerLat.toFixed(3)}° N, {zone.centerLng.toFixed(3)}° E</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      zone.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {zone.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Mapped Pincodes */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Mapped Postal Codes ({zone.pincodes.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.pincodes.map(pin => (
                      <span
                        key={pin}
                        className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[11px] font-semibold text-slate-700 border border-slate-200"
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom stats & edit */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span className="text-slate-600">
                      Fleet: <strong className="text-slate-900">{onDutyInZone} on duty</strong> / {totalInZone} total
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono">{zone.bufferMinutes}m buffer</span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingZone({ ...zone })}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                >
                  Edit Zone & Pincodes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Edit Zone: {editingZone.name}</h3>
              <button onClick={() => setEditingZone(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mapped Pincodes (Comma separated)
                </label>
                <input
                  type="text"
                  value={editingZone.pincodes.join(', ')}
                  onChange={e =>
                    setEditingZone({
                      ...editingZone,
                      pincodes: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Travel Buffer (Minutes)</label>
                <input
                  type="number"
                  value={editingZone.bufferMinutes}
                  onChange={e =>
                    setEditingZone({ ...editingZone, bufferMinutes: parseInt(e.target.value) || 20 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Operational Zone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rushikonda IT Park / PM Palem"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pincodes (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={pincodesStr}
                  onChange={e => setPincodesStr(e.target.value)}
                  placeholder="530045, 530048"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
