import React, { useState } from 'react';
import { Order, ALLOWED_VIAL_TYPES } from '../../types';
import {
  Barcode,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Thermometer,
  X
} from 'lucide-react';

interface ChainOfCustodyViewerProps {
  order: Order;
  compact?: boolean;
}

export const ChainOfCustodyViewer: React.FC<ChainOfCustodyViewerProps> = ({ order, compact = false }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
    description: string;
    type: 'sample' | 'handover';
  } | null>(null);

  const barcodes = order.scanned_barcodes || order.sampleVialsBarcodes || [];
  const hasSamplePhoto = !!order.sample_photo_url;
  const hasHandoverPhoto = !!order.handover_photo_url;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
            Chain of Custody & Verification
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          {barcodes.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {barcodes.length} Barcodes Logged
            </span>
          )}
          {hasSamplePhoto && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sample Photo Verified
            </span>
          )}
          {hasHandoverPhoto && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Handover Verified
            </span>
          )}
        </div>
      </div>

      {/* 1. Scanned Barcodes List */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-600 flex items-center space-x-1.5">
            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scanned Vial Barcodes ({barcodes.length} / {order.requiredVials.length} Vials)</span>
          </span>
          {barcodes.length >= order.requiredVials.length ? (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>All Vials Matched</span>
            </span>
          ) : (
            <span className="text-[10px] font-medium text-amber-600">
              {order.status === 'Pending' || order.status === 'Assigned' || order.status === 'En Route'
                ? 'Pending Collection Gate'
                : 'Partial scan logged'}
            </span>
          )}
        </div>

        {barcodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {barcodes.map((code, idx) => {
              // Parse vial label if in format "VialName:Code"
              const parts = code.includes(':') ? code.split(':') : [order.requiredVials[idx] || 'Vial', code];
              const vialName = parts[0];
              const barcodeValue = parts.slice(1).join(':') || code;
              const vialMeta = ALLOWED_VIAL_TYPES.find(v => v.id.toLowerCase() === vialName.toLowerCase());

              return (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2.5 hover:border-indigo-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                        vialMeta ? vialMeta.color : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {vialName}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold">✓ SCANNED</span>
                    </div>
                    <div className="font-mono text-[11px] font-black text-slate-900 truncate mt-0.5" title={barcodeValue}>
                      {barcodeValue}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs text-center">
            No vial barcodes recorded yet. Phlebotomist must scan each vial via device camera during collection.
          </div>
        )}
      </div>

      {/* 2. Photographic Proofs (Sample Photo & Lab Handover Photo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Sample Photo */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-700 flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sample Collection Photo Proof</span>
            </span>
            {hasSamplePhoto && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>

          {hasSamplePhoto ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 cursor-pointer"
              onClick={() => setSelectedPhoto({
                url: order.sample_photo_url!,
                title: `Sample Collection Proof - Order #${order.id}`,
                description: `Clear photographic verification of filled & labeled specimen vials collected from ${order.patientName}.`,
                type: 'sample'
              })}
            >
              <img
                src={order.sample_photo_url}
                alt="Sample collection proof"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 justify-between">
                <span className="text-[10px] font-medium text-white/90">
                  Labeled Specimen Vials
                </span>
                <span className="px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold flex items-center space-x-1">
                  <Maximize2 className="w-3 h-3" />
                  <span>Inspect</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400">
              <Camera className="w-6 h-6 text-slate-300 mb-1" />
              <span className="text-xs font-medium">Sample Photo Pending</span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Technician must capture photo of filled vials to complete collection gate
              </span>
            </div>
          )}
        </div>

        {/* Lab Handover Photo */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-700 flex items-center space-x-1.5">
              <FileCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Lab Counter Handover Proof</span>
            </span>
            {hasHandoverPhoto && (
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                Handover Complete
              </span>
            )}
          </div>

          {hasHandoverPhoto ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 cursor-pointer"
              onClick={() => setSelectedPhoto({
                url: order.handover_photo_url!,
                title: `Lab Counter Handover Proof - Order #${order.id}`,
                description: `Photographic verification of vials delivered to ${order.labName} receiving counter desk.`,
                type: 'handover'
              })}
            >
              <img
                src={order.handover_photo_url}
                alt="Lab handover proof"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 justify-between">
                <span className="text-[10px] font-medium text-white/90">
                  {order.labName} Counter Handover
                </span>
                <span className="px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold flex items-center space-x-1">
                  <Maximize2 className="w-3 h-3" />
                  <span>Inspect</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400">
              <FileCheck className="w-6 h-6 text-slate-300 mb-1" />
              <span className="text-xs font-medium">Handover Photo Pending</span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Technician must capture photo at lab desk to complete handover gate
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{selectedPhoto.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tenant: {order.labName} • Phlebotomist: {order.assignedPhlebotomistName || 'Assigned Tech'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex-1 flex items-center justify-center overflow-hidden min-h-[320px] max-h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="text-slate-300">{selectedPhoto.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Patient: <strong>{order.patientName}</strong> ({order.patientPhone})</span>
                <span>•</span>
                <span>Slot: <strong>{order.requestedSlot}</strong></span>
                {order.temperatureBoxRecorded && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400">Cold Box: {order.temperatureBoxRecorded}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
