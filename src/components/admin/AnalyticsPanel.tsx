import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Activity,
  Award
} from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const { orders, labs, zones, phlebotomists } = useApp();

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    o => o.status === 'Handed to Lab' || o.status === 'Sample Collected'
  ).length;
  const onTimeRate = 96.4;
  const avgCollectionMinutes = 18;
  const coldBoxCompliance = 99.1;

  const totalGMV = orders.length * 450;

  // Group by zone
  const zoneDistribution = zones.map(z => {
    const count = orders.filter(o => o.zoneId === z.id).length;
    const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : '0';
    return { name: z.name, count, pct };
  });

  return (
    <div className="space-y-6">
      {/* Top Operations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Order Volume
            </span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalOrders} Orders</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">↑ +24% vs last week</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              On-Time Slot Arrival
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{onTimeRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Avg 18 min transit buffer</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cold Chain Compliance
            </span>
            <Award className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-600 mt-2">{coldBoxCompliance}%</div>
          <div className="text-xs text-slate-500 mt-1">2°C - 6°C calibrated box</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Marketplace GMV
            </span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">₹{totalGMV.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Across 4 partner labs</div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Demand Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Vizag Zone Demand Distribution</span>
          </h3>

          <div className="space-y-3">
            {zoneDistribution.map(zd => (
              <div key={zd.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{zd.name}</span>
                  <span className="text-slate-600">
                    {zd.count} orders ({zd.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, Number(zd.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Lab Fulfillment Share */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Diagnostic Lab Order Fulfillment</span>
          </h3>

          <div className="space-y-3">
            {labs.map(lab => {
              const labOrders = orders.filter(o => o.labId === lab.id).length;
              const pct = totalOrders > 0 ? ((labOrders / totalOrders) * 100).toFixed(1) : '0';

              return (
                <div key={lab.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{lab.name}</div>
                    <div className="text-slate-500 text-[11px]">{lab.locality} • Rating {lab.rating}★</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{labOrders} orders</div>
                    <div className="text-teal-700 font-semibold text-[11px]">{pct}% share</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
