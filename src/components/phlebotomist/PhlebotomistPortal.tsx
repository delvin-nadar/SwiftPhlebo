import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, AllowedVialType, ALLOWED_VIAL_TYPES } from '../../types';
import { SampleCollectionModal } from './SampleCollectionModal';
import { LabHandoverModal } from './LabHandoverModal';
import { ChainOfCustodyViewer } from '../common/ChainOfCustodyViewer';
import {
  UserCheck,
  CheckCircle2,
  Navigation,
  Thermometer,
  Barcode,
  Building2,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Power,
  Layers,
  ChevronRight,
  Sparkles,
  DollarSign,
  AlertCircle,
  Truck,
  FileCheck,
  Camera,
  Eye
} from 'lucide-react';

interface PhlebotomistPortalProps {
  onOpenSecurityModal: () => void;
}

export const PhlebotomistPortal: React.FC<PhlebotomistPortalProps> = ({ onOpenSecurityModal }) => {
  const {
    currentUser,
    orders,
    phlebotomists,
    payouts,
    togglePhlebotomistDuty,
    updateOrderStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assigned_orders' | 'my_payouts'>('assigned_orders');
  
  // Gate Modals State
  const [collectingOrder, setCollectingOrder] = useState<Order | null>(null);
  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);

  const activePhlebo = phlebotomists.find(p => p.id === currentUser.phlebotomistId) || phlebotomists[0];

  // Scoped orders for this phlebotomist
  const myOrders = orders.filter(o => o.assignedPhlebotomistId === currentUser.phlebotomistId);
  const myPayouts = payouts.filter(p => p.phlebotomistId === currentUser.phlebotomistId);

  const handleToggleDuty = async () => {
    if (!currentUser.phlebotomistId) return;
    await togglePhlebotomistDuty(currentUser.phlebotomistId, !activePhlebo?.onDuty);
  };

  const handleStartTravel = async (orderId: string) => {
    await updateOrderStatus(orderId, 'En Route', {
      locationNote: 'Phlebotomist en route on two-wheeler with active cold storage carrier'
    });
  };

  const handleConfirmCollection = async (data: {
    scanned_barcodes: string[];
    sample_photo_url: string;
    temperatureBoxRecorded: string;
    notes?: string;
  }) => {
    if (!collectingOrder) return;
    await updateOrderStatus(collectingOrder.id, 'Sample Collected', {
      scanned_barcodes: data.scanned_barcodes,
      sample_photo_url: data.sample_photo_url,
      sampleVialsBarcodes: data.scanned_barcodes,
      temperatureBoxRecorded: data.temperatureBoxRecorded,
      notes: data.notes || collectingOrder.notes
    });
    setCollectingOrder(null);
  };

  const handleConfirmHandover = async (data: {
    handover_photo_url: string;
    notes?: string;
  }) => {
    if (!handoverOrder) return;
    await updateOrderStatus(handoverOrder.id, 'Handed to Lab', {
      handover_photo_url: data.handover_photo_url,
      notes: data.notes || 'Handover completed and verified at lab reception desk'
    });
    setHandoverOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Phlebotomist Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-5 z-10">
          <div className="relative">
            <img
              src={activePhlebo.photo}
              alt={activePhlebo.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
              activePhlebo.onDuty ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
            }`}>
              <Power className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{activePhlebo.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ID: {activePhlebo.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {activePhlebo.certification}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>{activePhlebo.vehicleType}: <strong>{activePhlebo.vehicleNumber}</strong></span>
              <span>•</span>
              <span>⭐ {activePhlebo.rating} ({activePhlebo.ratingCount} reviews)</span>
              <span>•</span>
              <span>Completed Today: <strong>{activePhlebo.currentLoadToday} samples</strong></span>
            </p>
          </div>
        </div>

        {/* On Duty Switch & Security Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10">
          <button
            onClick={handleToggleDuty}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm ${
              activePhlebo.onDuty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{activePhlebo.onDuty ? 'ON DUTY (Accepting Slots)' : 'OFF DUTY (Unavailable)'}</span>
          </button>

          <button
            onClick={onOpenSecurityModal}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Isolated Session</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('assigned_orders')}
          className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'assigned_orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Assigned Collections ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_payouts')}
          className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'my_payouts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>My Earnings & Payouts</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED ORDERS */}
      {activeTab === 'assigned_orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOrders.length > 0 ? (
              myOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-slate-900 text-base">
                        #{order.id}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'Sample Collected'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : order.status === 'Handed to Lab'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : order.status === 'En Route'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : order.status === 'Accepted'
                            ? 'bg-teal-100 text-teal-900 border border-teal-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{order.patientName}</span>
                        <span className="font-mono text-slate-500">{order.patientPhone}</span>
                      </div>
                      <div className="text-slate-500">
                        {order.patientAge}y • {order.patientGender}
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{order.address} ({order.locality})</span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-mono">{order.requestedDate} • {order.requestedSlot}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Fulfill for: <strong>{order.labName}</strong> ({order.labId})</span>
                      </div>
                    </div>

                    {/* Required Vials Specification */}
                    <div className="pt-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                        Specimens to Draw:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {order.requiredVials.map(v => (
                          <span key={v} className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-black rounded-md text-[11px]">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Chain of Custody Quick Proof Indicators if collected or handed over */}
                    {(order.scanned_barcodes?.length || order.sample_photo_url || order.handover_photo_url) && (
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase">
                          <span className="flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Chain of Custody Proofs</span>
                          </span>
                          <span className="text-emerald-700 font-bold font-mono">
                            {order.scanned_barcodes?.length || 0} Barcodes
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {order.sample_photo_url && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-black shrink-0 relative group">
                              <img
                                src={order.sample_photo_url}
                                alt="Sample photo"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}

                          {order.handover_photo_url && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-black shrink-0 relative group">
                              <img
                                src={order.handover_photo_url}
                                alt="Handover photo"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500 min-w-0">
                            {order.sample_photo_url && (
                              <div className="text-emerald-700 font-bold truncate">✓ Sample Photo Logged</div>
                            )}
                            {order.handover_photo_url && (
                              <div className="text-teal-700 font-bold truncate">✓ Handover Photo Logged</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {order.temperatureBoxRecorded && (
                      <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-[11px] text-teal-900 font-mono flex items-center space-x-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                        <span>Carrier: <strong>{order.temperatureBoxRecorded}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Field Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    {order.status === 'Assigned' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Accepted')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Slot Assignment</span>
                      </button>
                    )}

                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => handleStartTravel(order.id)}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Start Travel (En Route)</span>
                      </button>
                    )}

                    {order.status === 'En Route' && (
                      <button
                        onClick={() => setCollectingOrder(order)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Barcode className="w-4 h-4" />
                        <span>Open Barcode & Sample Photo Gate</span>
                      </button>
                    )}

                    {order.status === 'Sample Collected' && (
                      <button
                        onClick={() => setHandoverOrder(order)}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Open Lab Handover Photo Gate</span>
                      </button>
                    )}

                    {order.status === 'Handed to Lab' && (
                      <div className="text-center py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Fulfilled & Settled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400">
                No orders assigned right now. Toggle on duty to receive slot dispatches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PAYOUTS */}
      {activeTab === 'my_payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Earnings</span>
              <div className="text-2xl font-black text-slate-900 font-mono">₹{activePhlebo.earningsToday}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Auto-disbursed via UPI</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Lifetime Payouts</span>
              <div className="text-2xl font-black text-slate-900 font-mono">₹{activePhlebo.totalEarnings}</div>
              <span className="text-[10px] text-slate-400">{activePhlebo.completedOrdersCount} collections completed</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Per-Slot Structure</span>
              <div className="text-sm font-bold text-slate-800">₹180 Base + ₹50 Morning Slot Bonus</div>
              <span className="text-[10px] text-teal-700 font-bold">+ ₹20 to ₹50 Zone Distance Allowance</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900">Personal Disbursal History</h3>
              <p className="text-xs text-slate-500">Strictly scoped to your phlebotomist ID ({activePhlebo.id})</p>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Base Pay</th>
                  <th className="px-5 py-3">Morning Incentive</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Status & Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myPayouts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">#{p.orderId}</td>
                    <td className="px-5 py-3">{p.date}</td>
                    <td className="px-5 py-3">₹{p.basePay}</td>
                    <td className="px-5 py-3 text-emerald-700">+₹{p.morningIncentive + p.distanceBonus}</td>
                    <td className="px-5 py-3 font-mono font-black text-slate-900">₹{p.totalPay}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                      {p.paymentRef && (
                        <span className="text-[10px] text-slate-400 font-mono ml-2">{p.paymentRef}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAMPLE COLLECTION CHECKPOINT GATE MODAL */}
      {collectingOrder && (
        <SampleCollectionModal
          order={collectingOrder}
          onClose={() => setCollectingOrder(null)}
          onConfirm={handleConfirmCollection}
        />
      )}

      {/* LAB HANDOVER CHECKPOINT GATE MODAL */}
      {handoverOrder && (
        <LabHandoverModal
          order={handoverOrder}
          onClose={() => setHandoverOrder(null)}
          onConfirm={handleConfirmHandover}
        />
      )}

    </div>
  );
};
