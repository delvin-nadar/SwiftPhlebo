import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Order, ALLOWED_VIAL_TYPES, AllowedVialType } from '../../types';
import {
  Barcode,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Sparkles,
  Thermometer,
  ShieldCheck,
  Zap,
  Info,
  Check
} from 'lucide-react';

interface SampleCollectionModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (data: {
    scanned_barcodes: string[];
    sample_photo_url: string;
    temperatureBoxRecorded: string;
    notes?: string;
  }) => Promise<void>;
}

// Sample photo presets for quick testing / fallback
const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Standard 3-Vial Cold Rack',
    url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Labeled EDTA & Serum Vials',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cold Carrier Specimen Pouch',
    url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80'
  }
];

export const SampleCollectionModal: React.FC<SampleCollectionModalProps> = ({
  order,
  onClose,
  onConfirm
}) => {
  // Barcodes State (one entry per required vial or custom scanned barcodes)
  const [vialBarcodes, setVialBarcodes] = useState<Record<string, string>>({});
  const [activeVialForScan, setActiveVialForScan] = useState<string>(order.requiredVials[0] || 'Vial');

  // Photo State
  const [samplePhotoUrl, setSamplePhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cold Carrier Temp
  const [coldTemp, setColdTemp] = useState('3.8°C Cold Pack Active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scanner state
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Sound effect on successful barcode scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5 beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext might be restricted until user gesture; non-blocking
    }
  };

  // Start html5-qrcode scanner
  const startScanner = async (targetVial?: string) => {
    setScannerError(null);
    const vialToScan = targetVial || activeVialForScan;
    setActiveVialForScan(vialToScan);
    setIsScannerActive(true);

    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      }

      const html5QrCode = new Html5Qrcode('barcode-reader-box');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.333
        },
        (decodedText) => {
          // Barcode successfully decoded
          playBeep();
          setLastScannedCode(decodedText);
          setScanSuccessMessage(`Scanned: ${decodedText}`);
          
          // Map to the active vial
          setVialBarcodes(prev => ({
            ...prev,
            [activeVialForScan]: decodedText
          }));

          // Automatically select next unscanned vial if available
          const remainingVials = order.requiredVials.filter(v => v !== activeVialForScan && !vialBarcodes[v]);
          if (remainingVials.length > 0) {
            setActiveVialForScan(remainingVials[0]);
          }

          // Auto clear success message after 2.5s
          setTimeout(() => {
            setScanSuccessMessage(null);
          }, 2500);
        },
        () => {
          // Standard video frame scan pass (ignore non-barcode frames)
        }
      );
    } catch (err: any) {
      console.warn('HTML5 Barcode Scanner start notice:', err);
      setScannerError(
        'Live camera access is unavailable or denied. You can use the "Auto-Scan Demo Vial" button or type the barcode directly.'
      );
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch (err) {
      console.error('Stop scanner error:', err);
    }
    setIsScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
      }
    };
  }, []);

  // Handle auto-simulated scan (for rapid testing / environment without physical tubes)
  const handleAutoScanVial = (vial: string) => {
    playBeep();
    const code = `${order.labId}-${vial.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setVialBarcodes(prev => ({ ...prev, [vial]: code }));
    setScanSuccessMessage(`Simulated Scan: ${vial} -> ${code}`);
    setTimeout(() => setScanSuccessMessage(null), 2500);

    // Switch to next unscanned vial
    const nextUnscanned = order.requiredVials.find(v => v !== vial && !vialBarcodes[v]);
    if (nextUnscanned) {
      setActiveVialForScan(nextUnscanned);
    }
  };

  const handleScanAllDemoVials = () => {
    playBeep();
    const allScanned: Record<string, string> = {};
    order.requiredVials.forEach((vial, i) => {
      allScanned[vial] = `${order.labId}-${vial.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}${i + 1}`;
    });
    setVialBarcodes(allScanned);
    setScanSuccessMessage(`All ${order.requiredVials.length} vial barcodes successfully generated & logged!`);
    setTimeout(() => setScanSuccessMessage(null), 2500);
  };

  // Handle Photo File Upload / Capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSamplePhotoUrl(dataUrl);
      setPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = (url: string) => {
    setSamplePhotoUrl(url);
    setPhotoPreview(url);
  };

  // Gate validation criteria:
  const scannedCount = Object.keys(vialBarcodes).filter(k => !!vialBarcodes[k].trim()).length;
  const isBarcodesGatePassed = scannedCount > 0;
  const isPhotoGatePassed = !!samplePhotoUrl;
  const isFormReady = isBarcodesGatePassed && isPhotoGatePassed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady) return;

    setIsSubmitting(true);
    try {
      // Format as "VialName:BarcodeValue" or list of barcodes
      const scannedList = Object.entries(vialBarcodes)
        .filter(([_, code]: [string, string]) => Boolean(code && typeof code === 'string' && code.trim().length > 0))
        .map(([vial, code]: [string, string]) => `${vial}:${String(code).trim()}`);

      await onConfirm({
        scanned_barcodes: scannedList,
        sample_photo_url: samplePhotoUrl,
        temperatureBoxRecorded: coldTemp,
        notes: notes || undefined
      });
      await stopScanner();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">
                  Sample Collection Verification Gate
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Chain of Custody
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Order #{order.id} • {order.patientName} ({order.labName})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gate Progress Indicator */}
        <div className="bg-indigo-50/80 px-6 py-3 border-b border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isBarcodesGatePassed ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                {isBarcodesGatePassed ? '✓' : '1'}
              </span>
              <span className={`font-bold ${isBarcodesGatePassed ? 'text-emerald-800' : 'text-slate-700'}`}>
                Scan Barcodes ({scannedCount}/{order.requiredVials.length})
              </span>
            </div>

            <span className="text-slate-300">→</span>

            <div className="flex items-center space-x-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isPhotoGatePassed ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                {isPhotoGatePassed ? '✓' : '2'}
              </span>
              <span className={`font-bold ${isPhotoGatePassed ? 'text-emerald-800' : 'text-slate-700'}`}>
                Specimen Photo Proof
              </span>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isFormReady ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {isFormReady ? 'Gate Unlocked' : 'Gate Locked'}
          </span>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[72vh] space-y-6 text-xs text-slate-700 bg-slate-50">
          
          {/* STEP 1: BARCODE SCANNER (html5-qrcode) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-slate-900 flex items-center space-x-2">
                  <Barcode className="w-4 h-4 text-indigo-600" />
                  <span>Step 1: Scan Vials with HTML5 Barcode Camera</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Point camera at vial barcode label or select a vial to assign a code.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleScanAllDemoVials}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] flex items-center space-x-1 border border-indigo-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Scan All Vials</span>
                </button>

                {!isScannerActive ? (
                  <button
                    type="button"
                    onClick={() => startScanner()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Live Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-[11px] flex items-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Camera Viewfinder Box for html5-qrcode */}
            {isScannerActive && (
              <div className="rounded-2xl border-2 border-indigo-500 overflow-hidden bg-black relative p-2 shadow-inner">
                <div id="barcode-reader-box" className="w-full min-h-[220px]" />
                
                {/* Visual Laser Guide Overlay */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] pointer-events-none animate-pulse" />

                <div className="absolute bottom-3 inset-x-4 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-center text-[11px] flex items-center justify-between">
                  <span>Scanning for: <strong className="text-emerald-400">{activeVialForScan}</strong></span>
                  <span className="text-[10px] text-slate-300">Align barcode inside red laser line</span>
                </div>
              </div>
            )}

            {scannerError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-2 text-[11px]">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{scannerError}</span>
              </div>
            )}

            {scanSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center space-x-2 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scanSuccessMessage}</span>
              </div>
            )}

            {/* Required Vials List & Input Row */}
            <div className="space-y-2 pt-1">
              <span className="font-extrabold text-[10px] uppercase text-slate-400 block">
                Required Specimen Vials ({order.requiredVials.length}):
              </span>

              <div className="space-y-2">
                {order.requiredVials.map(vial => {
                  const vialMeta = ALLOWED_VIAL_TYPES.find(v => v.id === vial);
                  const isScanned = !!vialBarcodes[vial]?.trim();
                  const isCurrentTarget = activeVialForScan === vial;

                  return (
                    <div
                      key={vial}
                      onClick={() => setActiveVialForScan(vial)}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 cursor-pointer ${
                        isCurrentTarget
                          ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                          : isScanned
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black border shrink-0 ${
                          vialMeta ? vialMeta.color : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {vial}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                            <span>{vialMeta?.description || vial}</span>
                            {isScanned && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                                ✓ Scanned
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Target Tube: {vialMeta ? `${vialMeta.label} Vacutainer` : 'Standard Tube'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1 sm:w-56">
                          <input
                            type="text"
                            value={vialBarcodes[vial] || ''}
                            onChange={e => setVialBarcodes({ ...vialBarcodes, [vial]: e.target.value })}
                            placeholder={`e.g. ${order.labId}-${vial.slice(0, 3)}-8921`}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-indigo-600"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAutoScanVial(vial);
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-bold whitespace-nowrap"
                          title="Simulate quick scan"
                        >
                          Auto-Scan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: PHOTOGRAPHIC PROOF OF VIALS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-xs font-black text-slate-900 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Step 2: Capture Photo of Labeled Vials</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Take a clear camera snapshot or upload a photo showing the blood collection tubes clearly labeled with barcodes.
              </p>
            </div>

            {/* Photo Preview or Upload Dropzone */}
            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video max-h-56">
                  <img
                    src={photoPreview}
                    alt="Specimen photo preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo Verified & Attached</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSamplePhotoUrl('');
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
                    <span>Specimen photo captured successfully</span>
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
                      Click to Capture with Device Camera or Upload Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Supports high-resolution JPG, PNG (rear camera auto-selected)
                    </span>
                  </div>
                </div>

                {/* Quick Preset Picks for easy demo verification */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                    Or select a specimen photo preset for instant testing:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_PHOTO_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPresetPhoto(preset.url)}
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

            {/* Hidden Native File Input with camera capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* STEP 3: COLD CARRIER TEMPERATURE */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-black text-slate-900 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-teal-600" />
              <span>Cold Box Carrier Temp (2°C – 6°C Required)</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              {['3.2°C Cold Pack Active', '3.8°C Cold Pack Active', '4.4°C Cold Pack Active'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setColdTemp(t)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                    coldTemp === t
                      ? 'border-teal-600 bg-teal-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.split(' ')[0]}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Collection Notes / Patient Feedback (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Smooth collection, 3 vials drawn, seated resting posture."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Modal Footer / Gate Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {!isBarcodesGatePassed && (
                <span className="text-rose-600 font-bold block">• Please scan/enter at least 1 vial barcode</span>
              )}
              {!isPhotoGatePassed && (
                <span className="text-rose-600 font-bold block">• Please capture or upload specimen photo proof</span>
              )}
              {isFormReady && (
                <span className="text-emerald-700 font-bold block">✓ All verification checkpoints satisfied!</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isFormReady || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center space-x-2 transition-all shadow-sm ${
                  isFormReady && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Chain of Custody...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Mark Sample Collected</span>
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
