import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phlebotomist } from '../../types';
import {
  Users,
  Plus,
  Star,
  Bike,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign
} from 'lucide-react';

export const PhlebotomistRoster: React.FC = () => {
  const { phlebotomists, zones, togglePhlebotomistDuty, addPhlebotomist, updatePhlebotomist } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new phlebotomist
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [certification, setCertification] = useState('DMLT (Diploma in Medical Lab Technology)');
  const [homeZoneId, setHomeZoneId] = useState(zones[0]?.id || 'zone-mvp');
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Scooter'>('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('AP 31 ');
  const [travelRadiusKm, setTravelRadiusKm] = useState(8);

  const handleAddPhlebo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addPhlebotomist({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@swiftphlebo.in`,
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&h=200&q=80',
      certification,
      homeZoneId,
      onDuty: true,
      travelRadiusKm,
      vehicleType,
      vehicleNumber
    });

    setShowAddModal(false);
    setName('');
    setPhone('+91 ');
    setEmail('');
  };

  const getZoneName = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)?.name || zoneId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Phlebotomist Field Fleet & Roster</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage certifications, on-duty dispatches, and zone assignments across Visakhapatnam
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Phlebotomist</span>
        </button>
      </div>

      {/* Phlebotomist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phlebotomists.map(phlebo => {
          return (
            <div
              key={phlebo.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                phlebo.onDuty
                  ? 'border-slate-200 shadow-sm hover:border-teal-400'
                  : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div>
                {/* Top Row: Photo, Name, On-Duty Toggle */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={phlebo.photo}
                      alt={phlebo.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {phlebo.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-amber-600 font-bold text-xs mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{phlebo.rating}</span>
                        <span className="text-slate-400 font-normal">({phlebo.ratingCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* On Duty Switch */}
                  <button
                    type="button"
                    onClick={() => togglePhlebotomistDuty(phlebo.id, !phlebo.onDuty)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${
                      phlebo.onDuty
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        phlebo.onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    ></span>
                    <span>{phlebo.onDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
                  </button>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{phlebo.certification}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">
                      Home Zone: {getZoneName(phlebo.homeZoneId)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Bike className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {phlebo.vehicleType} ({phlebo.vehicleNumber}) • {phlebo.travelRadiusKm}km radius
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{phlebo.phone}</span>
                  </div>
                </div>
              </div>

              {/* Load & Earnings Metrics Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Orders Today</div>
                  <div className="font-black text-slate-900 text-sm mt-0.5">
                    {phlebo.currentLoadToday}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Lifetime</div>
                  <div className="font-black text-slate-900 text-sm mt-0.5">
                    {phlebo.completedOrdersCount}
                  </div>
                </div>

                <div className="bg-teal-50 p-2 rounded-xl text-teal-950">
                  <div className="text-[10px] text-teal-700 font-bold uppercase">Today Earnings</div>
                  <div className="font-black text-teal-900 text-sm mt-0.5">
                    ₹{phlebo.earningsToday}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Phlebotomist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Onboard Certified Phlebotomist</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPhlebo} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. K. Ravi Teja"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98480..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">DMLT / MLT Certification</label>
                <input
                  type="text"
                  value={certification}
                  onChange={e => setCertification(e.target.value)}
                  placeholder="e.g. DMLT - King George Hospital (KGH) Vizag"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Home Zone</label>
                  <select
                    value={homeZoneId}
                    onChange={e => setHomeZoneId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Plate No.</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    placeholder="AP 31 AB 1234"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
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
                  Register Phlebotomist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
