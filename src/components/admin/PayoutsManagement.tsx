import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayoutRecord } from '../../types';
import {
  Banknote,
  CheckCircle2,
  Clock,
  QrCode,
  DollarSign,
  TrendingUp,
  Download,
  Search,
  Filter,
  CreditCard
} from 'lucide-react';

export const PayoutsManagement: React.FC = () => {
  const { payouts, markPayoutPaid, phlebotomists } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Paid'>('all');

  const filteredPayouts = payouts.filter(p => {
    const matchesSearch =
      p.phlebotomistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = payouts
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.totalPay, 0);

  const totalPaid = payouts
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalPay, 0);

  const handlePayViaUpi = (payoutId: string) => {
    markPayoutPaid(payoutId, 'UPI');
  };

  return (
    <div className="space-y-6">
      {/* Header with Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Disbursal
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{totalPending}</div>
          <div className="text-xs text-slate-500 mt-1">
            {payouts.filter(p => p.status === 'Pending').length} orders awaiting payout
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Settled Payouts (This Month)
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalPaid}</div>
          <div className="text-xs text-slate-500 mt-1">Directly disbursed via UPI/NEFT</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Standard Payout Model
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">₹120 Base + Incentives</div>
          <div className="text-xs text-slate-500 mt-0.5">
            +₹30 cold box compliance + ₹20 on-time bonus
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Phlebotomist, Order ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Payout Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Paid">Paid / Settled Only</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Payout Ref</th>
                <th className="px-4 py-3">Phlebotomist</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Base Pay</th>
                <th className="px-4 py-3">Bonus & Incentive</th>
                <th className="px-4 py-3">Total Payout</th>
                <th className="px-4 py-3">Disbursal Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.map(payout => (
                <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    #{payout.id}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {payout.phlebotomistName}
                  </td>
                  <td className="px-4 py-3 font-mono text-teal-700 font-semibold">
                    #{payout.orderId}
                  </td>
                  <td className="px-4 py-3 font-medium">₹{payout.basePay}</td>
                  <td className="px-4 py-3 text-emerald-700 font-medium">
                    +₹{payout.distanceBonus + payout.morningIncentive}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900 text-sm">
                    ₹{payout.totalPay}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        payout.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {payout.status === 'Pending' ? (
                      <button
                        onClick={() => handlePayViaUpi(payout.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center space-x-1 ml-auto"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay via UPI</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {payout.paymentRef || 'UPI/SETTLED'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
