import React, { useState, useRef } from 'react';
import { Order, ALLOWED_VIAL_TYPES } from '../../types';
import {
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  Barcode,
  Info
} from 'lucide-react';

interface LabHandoverModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (data: {
    handover_photo_url: string;
    notes?: string;
  }) => Promise<void>;
}

const HANDOVER_PHOTO_PRESETS = [
  {
    name: 'Diagnostic Counter Sample Desk',
    url: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Lab Intake Receiving Station',
    url: 'https://images.unsplash.com/photo-1583912267670-6575ad4e5b36?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Signed Lab Specimen Transfer',
    url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80'
  }
];

export const LabHandoverModal: React.FC<LabHandoverModalProps> = ({
  order,
  onClose,
  onConfirm
}) => {
  const [handoverPhotoUrl, setHandoverPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [receivingStaffName, setReceivingStaffName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setHandoverPhotoUrl(dataUrl);
      setPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setHandoverPhotoUrl(url);
    setPhotoPreview(url);
  };

  const isPhotoReady = !!handoverPhotoUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhotoReady) return;

    setIsSubmitting(true);
    try {
      const fullNote = receivingStaffName
        ? `Handover verified and signed by lab technician: ${receivingStaffName}. ${notes}`.trim()
        : notes || `Handover completed at ${order.labName} receiving desk`;

      await onConfirm({
        handover_photo_url: handoverPhotoUrl,
        notes: fullNote
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const barcodes = order.scanned_barcodes || order.sampleVialsBarcodes || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">
                  Lab Counter Handover Verification Gate
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Final Custody Step
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Delivering to: <strong className="text-emerald-300">{order.labName}</strong> ({order.labId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gate Progress Bar */}
        <div className="bg-emerald-50/80 px-6 py-3 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-950">
              Mandatory Photographic Proof of Handover at Lab Desk
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isPhotoReady ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {isPhotoReady ? 'Gate Ready' : 'Photo Required'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[72vh] space-y-6 text-xs text-slate-700 bg-slate-50">
          
          {/* Order Summary & Barcodes Check */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-slate-900 text-sm">Order #{order.id}</span>
              <span className="text-slate-500 font-medium">{order.patientName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Specimens:</span>
              {order.requiredVials.map(v => (
                <span key={v} className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {v}
                </span>
              ))}
            </div>

            {barcodes.length > 0 && (
              <div className="pt-1 flex items-center space-x-1.5 text-[11px] text-indigo-700 font-mono font-bold">
                <Barcode className="w-3.5 h-3.5" />
                <span>Verified Scanned Barcodes: {barcodes.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Handover Photo Capture / Upload */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-xs font-black text-slate-900 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Capture Lab Desk Handover Photo</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Take a clear photo of the specimen vials on the {order.labName} intake counter or in the hands of the lab receiving tech.
              </p>
            </div>

            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video max-h-56">
                  <img
                    src={photoPreview}
                    alt="Handover photo preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Handover Photo Attached</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setHandoverPhotoUrl('');
                      setPhotoPreview('');
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs backdrop-blur-xs transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Lab handover proof captured</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-600 hover:text-slate-900 font-bold underline"
                  >
                    Retake / Replace Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      Click to Capture with Device Camera or Upload Handover Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Proof of sample delivery at lab counter desk
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                    Or select a handover photo preset for instant testing:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {HANDOVER_PHOTO_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all group"
                      >
                        <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-800 truncate block">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Receiving Staff Info & Notes */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Receiving Lab Desk Staff Name / Tech ID (Optional):
              </label>
              <input
                type="text"
                value={receivingStaffName}
                onChange={e => setReceivingStaffName(e.target.value)}
                placeholder="e.g., K. Appala Raju (Lab Reception Staff)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Handover Notes (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., All 3 tubes received with cold temperature intact."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Footer / Gate Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs">
              {!isPhotoReady ? (
                <span className="text-rose-600 font-bold">• Handover photo is mandatory to unlock completion</span>
              ) : (
                <span className="text-emerald-700 font-bold">✓ Ready to finalize lab handover & trigger payout!</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isPhotoReady || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center space-x-2 transition-all shadow-sm ${
                  isPhotoReady && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Handover...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Lab Handover</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
