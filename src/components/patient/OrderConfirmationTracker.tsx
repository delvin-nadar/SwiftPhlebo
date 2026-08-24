import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, AllowedVialType, ALLOWED_VIAL_TYPES } from '../../types';
import { ChainOfCustodyViewer } from '../common/ChainOfCustodyViewer';
import {
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Thermometer,
  FileCheck,
  Sparkles,
  ArrowRight,
  Barcode
} from 'lucide-react';

interface OrderConfirmationTrackerProps {
  orderId: string;
  onBookAnother: () => void;
  onOpenWhatsAppSimulator?: () => void;
}

export const OrderConfirmationTracker: React.FC<OrderConfirmationTrackerProps> = ({
  orderId,
  onBookAnother
}) => {
  const { orders, updateOrderStatus } = useApp();
  const order = orders.find(o => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto">
        <h3 className="font-bold text-slate-800">Order Not Found</h3>
        <button
          onClick={onBookAnother}
          className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold"
        >
          Book a Specimen Collection
        </button>
      </div>
    );
  }

  // Stages in chronological order
  const stages: { status: OrderStatus; label: string; sub: string }[] = [
    { status: 'Pending', label: 'Order Registered', sub: 'Scoped to partner lab tenant' },
    { status: 'Assigned', label: 'Phlebotomist Assigned', sub: 'Matched with nearest on-duty technician' },
    { status: 'Accepted', label: 'Slot Confirmed', sub: 'Technician confirmed 06:00-11:00 slot' },
    { status: 'En Route', label: 'Technician En Route', sub: 'Heading towards collection address' },
    { status: 'Sample Collected', label: 'Sample Drawn & Sealed', sub: 'Barcoded and stored in 4°C cold box' },
    { status: 'Handed to Lab', label: 'Handed Over to Lab Desk', sub: 'Fulfillment completed' }
  ];

  const currentStatusIndex = stages.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Success Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tenant Order: {order.labId} • {order.labName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Order #{order.id}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Collection Slot: <strong className="text-emerald-300 font-mono">{order.requestedSlot}</strong> on{' '}
              <strong className="text-emerald-300 font-mono">{order.requestedDate}</strong>
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-right sm:min-w-[180px]">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">{order.status}</div>
          </div>
        </div>
      </div>

      {/* Required Specimen Vials (Strictly Specimen Only) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
          <Barcode className="w-4 h-4 text-emerald-600" />
          <span>Required Specimen Vials ({order.requiredVials.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {order.requiredVials.map(vial => {
            const vialMeta = ALLOWED_VIAL_TYPES.find(v => v.id === vial);
            return (
              <div
                key={vial}
                className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center space-x-2 ${
                  vialMeta ? vialMeta.color : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span>{vial}</span>
                {vialMeta && <span className="text-[10px] opacity-75 font-normal">({vialMeta.description})</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Progress Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-slate-900">
          Chain-of-Custody & Dispatch Tracking
        </h3>

        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <div
                key={stage.status}
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-4 ${
                  isCurrent
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-100 opacity-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900">{stage.label}</h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{stage.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient & Location Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 text-xs">
          <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Patient Details</span>
          <div className="font-bold text-slate-900">{order.patientName}</div>
          <div className="text-slate-500">{order.patientPhone}</div>
          <div className="text-slate-500">{order.patientAge}y • {order.patientGender}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 text-xs">
          <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Collection Address</span>
          <div className="font-bold text-slate-900">{order.address}</div>
          <div className="text-teal-700 font-bold">{order.zoneName} ({order.pincode})</div>
        </div>
      </div>

      {/* Chain of Custody & Sample Verification */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <ChainOfCustodyViewer order={order} />
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onBookAnother}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
        >
          Book Another Specimen Collection
        </button>
      </div>

    </div>
  );
};
