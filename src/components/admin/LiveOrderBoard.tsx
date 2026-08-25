import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, Phlebotomist, AllowedVialType, ALLOWED_VIAL_TYPES } from '../../types';
import { ChainOfCustodyViewer } from '../common/ChainOfCustodyViewer';
import {
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  UserCheck,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  Layers,
  X
} from 'lucide-react';

export const LiveOrderBoard: React.FC = () => {
  const {
    orders,
    phlebotomists,
    zones,
    labs,
    updateOrderStatus,
    assignPhlebotomist
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Assign modal state
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);
  const [selectedPhleboId, setSelectedPhleboId] = useState<string>('');

  const statuses: OrderStatus[] = [
    'Pending',
    'Assigned',
    'Accepted',
    'En Route',
    'Sample Collected',
    'Handed to Lab',
    'Cancelled'
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientPhone.includes(searchQuery) ||
        order.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.labName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLab = selectedLabFilter === 'all' || order.labId === selectedLabFilter;
      const matchesZone = selectedZoneFilter === 'all' || order.zoneId === selectedZoneFilter;
      const matchesStatus = selectedStatusFilter === 'all' || order.status === selectedStatusFilter;

      return matchesSearch && matchesLab && matchesZone && matchesStatus;
    });
  }, [orders, searchQuery, selectedLabFilter, selectedZoneFilter, selectedStatusFilter]);

  const handleOpenAssign = (order: Order) => {
    setAssignModalOrder(order);
    const firstOnDuty = phlebotomists.find(p => p.onDuty && p.homeZoneId === order.zoneId) || phlebotomists.find(p => p.onDuty) || phlebotomists[0];
    setSelectedPhleboId(firstOnDuty?.id || '');
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignModalOrder && selectedPhleboId) {
      await assignPhlebotomist(assignModalOrder.id, selectedPhleboId);
      setAssignModalOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, order ID, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Lab Filter */}
          <select
            value={selectedLabFilter}
            onChange={e => setSelectedLabFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Labs ({labs.length})</option>
            {labs.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.id})</option>
            ))}
          </select>

          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={e => setSelectedZoneFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Vizag Zones ({zones.length})</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Order ID & Lab</th>
                  <th className="px-5 py-4">Patient Details</th>
                  <th className="px-5 py-4">Address & Zone</th>
                  <th className="px-5 py-4">Required Vials</th>
                  <th className="px-5 py-4">Slot (06:00-11:00)</th>
                  <th className="px-5 py-4">Assigned Phlebo</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        #{order.id}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {order.labName} ({order.labId})
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{order.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {order.patientPhone} • {order.patientAge}y {order.patientGender}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="truncate max-w-[170px] text-slate-800 font-medium" title={order.address}>
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
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
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
                      {(() => {
                        const assignedName = order.assignedPhlebotomistName || (order.assignedPhlebotomistId && phlebotomists.find(p => p.id === order.assignedPhlebotomistId)?.name);
                        const assignedPhone = order.assignedPhlebotomistPhone || (order.assignedPhlebotomistId && phlebotomists.find(p => p.id === order.assignedPhlebotomistId)?.phone);

                        return assignedName ? (
                          <div className="flex items-center space-x-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                              {assignedName[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{assignedName}</div>
                              <div className="text-[10px] text-slate-400">{assignedPhone || 'DMLT'}</div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssign(order)}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs"
                          >
                            + Assign Phlebo
                          </button>
                        );
                      })()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
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

                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenAssign(order)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
                      >
                        Reassign
                      </button>
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                      >
                        Inspect
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.slice(0, 6).map(status => {
            const statusOrders = filteredOrders.filter(o => o.status === status);
            return (
              <div key={status} className="bg-slate-100/70 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">{status}</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-slate-700">
                    {statusOrders.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {statusOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderDetails(order)}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-emerald-400 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900">#{order.id}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                          {order.labId}
                        </span>
                      </div>

                      <div className="font-bold text-slate-800">{order.patientName}</div>
                      <div className="text-slate-500 truncate">{order.address}</div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {order.requiredVials.map(v => (
                          <span key={v} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] rounded">
                            {v}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>{order.requestedSlot}</span>
                        <span className="text-teal-700 font-bold">{order.assignedPhlebotomistName?.split(' ')[0] || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Phlebotomist to #{assignModalOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {assignModalOrder.patientName} • {assignModalOrder.zoneName}
                </p>
              </div>
              <button
                onClick={() => setAssignModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Technician</label>
                <select
                  value={selectedPhleboId}
                  onChange={e => setSelectedPhleboId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white"
                >
                  {phlebotomists.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.certification.split('-')[0].trim()}) - {p.onDuty ? 'ON DUTY' : 'OFF DUTY'} [Load: {p.currentLoadToday}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold">
                  #{selectedOrderDetails.id}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Order Supervision: {selectedOrderDetails.patientName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tenant: {selectedOrderDetails.labName} ({selectedOrderDetails.labId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-slate-50">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Required Specimen Vials:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedOrderDetails.requiredVials.map(v => (
                    <span key={v} className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg text-xs">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Patient:</span>
                  <div className="font-bold text-slate-900">{selectedOrderDetails.patientName}</div>
                  <div className="text-slate-500">{selectedOrderDetails.patientPhone}</div>
                  <div className="text-slate-500">{selectedOrderDetails.patientAge}y • {selectedOrderDetails.patientGender}</div>
                </div>
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Address:</span>
                  <div className="font-bold text-slate-900">{selectedOrderDetails.address}</div>
                  <div className="text-teal-700 font-bold">{selectedOrderDetails.zoneName} ({selectedOrderDetails.pincode})</div>
                </div>
              </div>

              {/* Strict Chain of Custody & Barcode Visual Proof Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <ChainOfCustodyViewer order={selectedOrderDetails} />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 block">Fulfillment Timeline:</span>
                <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                  {selectedOrderDetails.timeline.map((evt, idx) => (
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
