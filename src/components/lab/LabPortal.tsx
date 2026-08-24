import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AllowedVialType,
  BookingSlot,
  ALLOWED_VIAL_TYPES,
  ALLOWED_BOOKING_SLOTS,
  SlotAvailability,
  Order
} from '../../types';
import { ChainOfCustodyViewer } from '../common/ChainOfCustodyViewer';
import {
  Building2,
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  User,
  Phone,
  Layers,
  ChevronRight,
  ShieldCheck,
  Thermometer,
  Barcode,
  Truck,
  Sparkles,
  Lock,
  Eye,
  X
} from 'lucide-react';

interface LabPortalProps {
  onOpenSecurityModal: () => void;
}

export const LabPortal: React.FC<LabPortalProps> = ({ onOpenSecurityModal }) => {
  const {
    currentUser,
    orders,
    zones,
    labs,
    createOrder,
    getSlotAvailability,
    refreshData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'new_booking' | 'lab_profile'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Booking State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('530017');
  const [zoneId, setZoneId] = useState('zone-mvp');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().slice(0, 10));
  const [requestedSlot, setRequestedSlot] = useState<BookingSlot>('07:00 - 08:00');
  const [requiredVials, setRequiredVials] = useState<AllowedVialType[]>(['Serum', 'EDTA']);
  const [notes, setNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Slot Availability state
  const [slotAvailabilities, setSlotAvailabilities] = useState<SlotAvailability[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const activeLab = labs.find(l => l.id === currentUser.labId) || labs[0];

  // Fetch slot availability whenever zone or date changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSlots(true);
    getSlotAvailability(zoneId, requestedDate).then(slots => {
      if (isMounted) {
        setSlotAvailabilities(slots);
        setIsLoadingSlots(false);
        // Ensure default slot is available
        const currentSlotObj = slots.find(s => s.slot === requestedSlot);
        if (currentSlotObj && currentSlotObj.status === 'full') {
          const firstAvailable = slots.find(s => s.status !== 'full');
          if (firstAvailable) {
            setRequestedSlot(firstAvailable.slot);
          }
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [zoneId, requestedDate, getSlotAvailability]);

  // Handle Zone selection based on Pincode
  const handlePincodeChange = (pin: string) => {
    setPincode(pin);
    if (pin.length === 6) {
      const matchingZone = zones.find(z => z.pincodes.includes(pin));
      if (matchingZone) {
        setZoneId(matchingZone.id);
        setLocality(matchingZone.name.split('&')[0].trim());
      }
    }
  };

  const toggleVial = (vialId: AllowedVialType) => {
    if (requiredVials.includes(vialId)) {
      if (requiredVials.length === 1) return; // Keep at least one
      setRequiredVials(requiredVials.filter(v => v !== vialId));
    } else {
      setRequiredVials([...requiredVials, vialId]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!patientName || !patientPhone || !address) {
      setSubmitError('Please fill all required patient and address fields.');
      return;
    }

    if (requiredVials.length === 0) {
      setSubmitError('Select at least one required specimen vial.');
      return;
    }

    // Verify slot capacity
    const selectedSlotObj = slotAvailabilities.find(s => s.slot === requestedSlot);
    if (selectedSlotObj && selectedSlotObj.status === 'full') {
      setSubmitError('Fully booked — please select another time slot.');
      return;
    }

    setIsSubmitting(true);
    const result = await createOrder({
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      address,
      landmark,
      locality: locality || zones.find(z => z.id === zoneId)?.name || 'Visakhapatnam',
      pincode,
      zoneId,
      zoneName: zones.find(z => z.id === zoneId)?.name || 'Vizag Zone',
      requestedDate,
      requestedSlot,
      requiredVials,
      notes,
      specialInstructions
    });

    setIsSubmitting(false);

    if (result.success && result.order) {
      setSubmitSuccess(`Order #${result.order.id} booked successfully and assigned to technician.`);
      // Reset form
      setPatientName('');
      setPatientPhone('');
      setAddress('');
      setLandmark('');
      setNotes('');
      setSpecialInstructions('');
      setActiveTab('orders');
    } else {
      setSubmitError(result.error || 'Failed to submit order.');
    }
  };

  // Filter lab orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientPhone.includes(searchQuery) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Tenant Header & Security Indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-emerald-50/70 to-transparent pointer-events-none" />
        
        <div className="flex items-start sm:items-center space-x-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{activeLab.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                Tenant: {currentUser.labId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {activeLab.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{activeLab.address}</span>
              <span>•</span>
              <span className="font-mono">{activeLab.phone}</span>
            </p>
          </div>
        </div>

        {/* Security & Multi-Tenant Guarantee Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant Partition Active</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Strictly scoped to <strong>{currentUser.labId}</strong> orders only
            </div>
          </div>

          <button
            onClick={onOpenSecurityModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Security & Authorization</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Specimen Collection Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new_booking')}
          className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'new_booking'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Home Specimen Collection</span>
        </button>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, order ID, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-emerald-600"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Accepted">Accepted</option>
                <option value="En Route">En Route</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Handed to Lab">Handed to Lab</option>
              </select>

              <button
                onClick={() => setActiveTab('new_booking')}
                className="ml-auto sm:ml-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Order ID & Date</th>
                    <th className="px-5 py-4">Patient Details</th>
                    <th className="px-5 py-4">Address & Zone</th>
                    <th className="px-5 py-4">Required Vials</th>
                    <th className="px-5 py-4">Time Slot</th>
                    <th className="px-5 py-4">Assigned Phlebotomist</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono font-black text-slate-900 text-sm block">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {order.requestedDate}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{order.patientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {order.patientPhone} • {order.patientAge}y {order.patientGender}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="truncate max-w-[180px] font-medium text-slate-800" title={order.address}>
                            {order.address}
                          </div>
                          <div className="text-[11px] font-bold text-teal-700">
                            {order.zoneName} ({order.pincode})
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.requiredVials.map(vial => {
                              const vialMeta = ALLOWED_VIAL_TYPES.find(v => v.id === vial);
                              return (
                                <span
                                  key={vial}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                    vialMeta ? vialMeta.color : 'bg-slate-100 border-slate-300 text-slate-800'
                                  }`}
                                >
                                  {vial}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                            {order.requestedSlot}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {order.assignedPhlebotomistName ? (
                            <div className="flex items-center space-x-1.5">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                                {order.assignedPhlebotomistName[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{order.assignedPhlebotomistName}</div>
                                <div className="text-[10px] text-slate-400">{order.assignedPhlebotomistPhone}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Auto-dispatching...</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-block ${
                              order.status === 'Sample Collected'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : order.status === 'Handed to Lab'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : order.status === 'En Route'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : order.status === 'Accepted'
                                ? 'bg-teal-100 text-teal-900 border border-teal-200'
                                : order.status === 'Assigned'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                          {order.temperatureBoxRecorded && (
                            <div className="text-[10px] text-teal-700 font-mono mt-1 font-bold flex items-center gap-1">
                              <Thermometer className="w-3 h-3 text-teal-600" />
                              <span>{order.temperatureBoxRecorded}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                        No collection orders found for {activeLab.name}. Book your first home specimen collection!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEW SPECIMEN COLLECTION BOOKING FORM */}
      {activeTab === 'new_booking' && (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-slate-900">Book Patient Specimen Collection</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  Lab ID: {currentUser.labId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select required collection vial specifications and 06:00–11:00 AM dispatch slot in Visakhapatnam
              </p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {/* Step 1: Patient Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Patient Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Raju"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone (for WhatsApp alerts) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98491 55210"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biological Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPatientGender(g)}
                        className={`py-2 rounded-xl font-bold transition-all ${
                          patientGender === g
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Collection Address & Vizag Zone */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Doorstep Address & Vizag Zone</span>
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flat / House No. & Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Sagar View Towers, Ushodaya Junction"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pincode (Vizag) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 530017"
                      value={pincode}
                      onChange={e => handlePincodeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operational Zone</label>
                    <select
                      value={zoneId}
                      onChange={e => setZoneId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white"
                    >
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Opp. Apollo Pharmacy"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Required Specimen / Vial Types (NO DIAGNOSTIC TESTS) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>3. Required Specimen / Vial Types</span>
                </h4>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Confidential Specification (No Test Names)
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Select the exact vials and containers required for this sample pickup:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALLOWED_VIAL_TYPES.map(vial => {
                  const isSelected = requiredVials.includes(vial.id);
                  return (
                    <button
                      key={vial.id}
                      type="button"
                      onClick={() => toggleVial(vial.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${vial.color}`}>
                          {vial.label}
                        </span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">
                        {vial.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Booking Slot Restriction (Strictly 06:00 - 11:00 AM) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>4. Morning Collection Slot (06:00 AM – 11:00 AM)</span>
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Dynamic Capacity Engine Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collection Date</label>
                  <input
                    type="date"
                    value={requestedDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setRequestedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Select 1-Hour Time Slot {isLoadingSlots && <span className="text-slate-400 font-normal">(calculating capacity...)</span>}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {ALLOWED_BOOKING_SLOTS.map(slot => {
                      const slotInfo = slotAvailabilities.find(s => s.slot === slot);
                      const isFull = slotInfo?.status === 'full';
                      const isSelected = requestedSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => setRequestedSlot(slot)}
                          className={`p-3 rounded-xl border text-left font-mono transition-all ${
                            isFull
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed text-slate-400'
                              : isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-black shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold">{slot}</div>
                          <div className={`text-[10px] mt-1 ${
                            isSelected ? 'text-emerald-100' : isFull ? 'text-rose-600 font-bold' : 'text-slate-500'
                          }`}>
                            {isFull
                              ? 'Fully Booked'
                              : slotInfo
                              ? `${slotInfo.availableCount} slots open`
                              : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Special Instructions */}
            <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Phlebotomist Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient has fragile veins. Please ring bell twice."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Booking Collection...' : 'Confirm & Dispatch Specimen Order'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
                  #{selectedOrder.id}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Order Details: {selectedOrder.patientName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedOrder.requestedDate} • {selectedOrder.requestedSlot}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-slate-50">
              {/* Vials Specification */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Required Specimen Vials:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.requiredVials.map(v => (
                    <span key={v} className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg text-xs">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Patient & Location */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Patient:</span>
                  <div className="font-bold text-slate-900">{selectedOrder.patientName}</div>
                  <div className="text-slate-500">{selectedOrder.patientPhone}</div>
                  <div className="text-slate-500">{selectedOrder.patientAge}y • {selectedOrder.patientGender}</div>
                </div>
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Address & Zone:</span>
                  <div className="font-bold text-slate-900">{selectedOrder.address}</div>
                  <div className="text-teal-700 font-bold">{selectedOrder.zoneName} ({selectedOrder.pincode})</div>
                </div>
              </div>

              {/* Technician & Cold Box Details */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Assigned Phlebotomist:</span>
                  <div className="font-bold text-slate-900">{selectedOrder.assignedPhlebotomistName || 'Auto-Dispatch'}</div>
                  <div className="text-slate-500">{selectedOrder.assignedPhlebotomistPhone}</div>
                </div>
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Cold Storage Verification:</span>
                  <div className="font-bold text-teal-800 font-mono">
                    {selectedOrder.temperatureBoxRecorded || 'Pending Collection'}
                  </div>
                </div>
              </div>

              {/* Strict Chain of Custody Verification Section (Barcodes + Photo Proofs) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <ChainOfCustodyViewer order={selectedOrder} />
              </div>

              {/* Timeline */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Fulfillment Timeline:</span>
                <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                  {selectedOrder.timeline.map((evt, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 absolute -left-[21px] top-1.5" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{evt.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
