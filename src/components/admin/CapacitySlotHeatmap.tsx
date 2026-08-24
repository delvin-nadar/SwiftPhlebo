import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getZoneCapacityMatrix, OPERATING_SLOTS } from '../../utils/capacityLogic';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';

export const CapacitySlotHeatmap: React.FC = () => {
  const { zones, phlebotomists, orders, togglePhlebotomistDuty } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const matrix = useMemo(() => {
    return getZoneCapacityMatrix(zones, selectedDate, phlebotomists, orders);
  }, [zones, selectedDate, phlebotomists, orders]);

  const underCoveredZones = matrix.filter(m => m.onDutyPhlebosCount === 0);
  const totalOnDuty = phlebotomists.filter(p => p.onDuty).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>06:00 AM – 11:00 AM Zone Dispatch Capacity Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic capacity calculation based on on-duty phlebotomists (2 orders/hr max with travel buffer)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 bg-white"
          />
        </div>
      </div>

      {/* Under-Coverage Alert Banner if any zone has 0 on duty */}
      {underCoveredZones.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                Zone Coverage Advisory ({underCoveredZones.length} Zones Assigned to Secondary Fleet)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Zones: {underCoveredZones.map(z => z.zoneName).join(', ')}. Dispatches supported by roving phlebotomists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Matrix Heatmap Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4 min-w-[200px]">Vizag Operational Zone</th>
                <th className="px-4 py-4 text-center">On-Duty Fleet</th>
                {OPERATING_SLOTS.map(s => (
                  <th key={s.slot} className="px-4 py-4 text-center font-mono font-bold">
                    {s.slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {matrix.map(row => (
                <tr key={row.zoneId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">{row.zoneName}</div>
                    <div className="text-[11px] text-slate-400">
                      {row.totalOrdersInZoneToday} total bookings today
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      row.onDutyPhlebosCount > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.onDutyPhlebosCount} Techs
                    </span>
                  </td>

                  {row.slots.map(slotInfo => {
                    const isFull = slotInfo.status === 'full';
                    const isFastFilling = slotInfo.status === 'fast_filling';

                    return (
                      <td key={slotInfo.slot} className="px-3 py-3 text-center">
                        <div
                          className={`p-2.5 rounded-2xl border text-center transition-all ${
                            isFull
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : isFastFilling
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="font-mono font-black text-xs">
                            {slotInfo.bookedCount} / {slotInfo.totalCapacity}
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                            isFull ? 'text-rose-600' : isFastFilling ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {isFull ? 'Full' : `${slotInfo.availableCount} Open`}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
