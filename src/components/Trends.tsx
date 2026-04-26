import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Flame, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils.ts';

interface TrendsProps {
  bills: any[];
}

export default function Trends({ bills }: TrendsProps) {
  const [activeTab, setActiveTab] = useState<'KE' | 'SSGC' | 'COMBINED'>('COMBINED');

  const filteredBills = bills.filter(b => activeTab === 'COMBINED' ? true : b.bill_type === activeTab);
  const sortedBills = [...filteredBills].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  const chartData = sortedBills.map(bill => ({
    month: bill.billing_month,
    qty: bill.bill_type === 'SSGC' ? bill.measured_qty_cms : bill.units_consumed,
    amount: (bill.payable_within_due_date || bill.total_amount),
    type: bill.bill_type
  }));

  // Combined visualization data
  const monthMap = new Map();
  bills.forEach(bill => {
    const month = bill.billing_month;
    if (!monthMap.has(month)) monthMap.set(month, { month, ke: 0, ssgc: 0, total: 0 });
    const data = monthMap.get(month);
    const amount = (bill.payable_within_due_date || bill.total_amount);
    if (bill.bill_type === 'SSGC') data.ssgc += amount;
    else data.ke += amount;
    data.total += amount;
  });

  const combinedData = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  const lastBill = sortedBills[sortedBills.length - 1];
  const prevBill = sortedBills.length > 1 ? sortedBills[sortedBills.length - 2] : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          {activeTab !== 'COMBINED' ? (
            <>
              <p className={cn("text-lg font-black font-sans text-slate-900")}>
                {payload[0].value} {activeTab === 'SSGC' ? 'CMs' : 'Units'}
              </p>
              <p className={cn("text-xs font-bold", activeTab === 'SSGC' ? "text-green-600" : "text-blue-600")}>Rs. {payload[1]?.value.toLocaleString()}</p>
            </>
          ) : (
             <div className="space-y-1">
                <p className="text-xs font-bold text-blue-600">KE: Rs. {payload[0].value.toLocaleString()}</p>
                <p className="text-xs font-bold text-green-600">SSGC: Rs. {payload[1].value.toLocaleString()}</p>
                <p className="text-sm font-black text-slate-900 pt-1 border-t border-slate-100">Total: Rs. {payload[2].value.toLocaleString()}</p>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Utility Performance</h2>
          <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">Track your consumption history</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('COMBINED')} className={cn("px-5 py-2 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-2", activeTab === 'COMBINED' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}>
            <LayoutGrid size={14} /> Combined
          </button>
          <button onClick={() => setActiveTab('KE')} className={cn("px-5 py-2 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-2", activeTab === 'KE' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}>
            <Zap size={14} className={activeTab === 'KE' ? "fill-current" : ""} /> KE
          </button>
          <button onClick={() => setActiveTab('SSGC')} className={cn("px-5 py-2 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-2", activeTab === 'SSGC' ? "bg-green-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}>
            <Flame size={14} className={activeTab === 'SSGC' ? "fill-current" : ""} /> SSGC
          </button>
        </div>
      </div>

      {activeTab === 'COMBINED' ? (
         <div className="bento-card p-8 bg-white border-slate-200 shadow-sm overflow-hidden">
           <div className="h-[350px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={combinedData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip content={<CustomTooltip />} />
                 <Area type="monotone" dataKey="ke" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                 <Area type="monotone" dataKey="ssgc" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                 <Area type="monotone" dataKey="total" hide />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bento-card p-8 bg-white border-slate-200 shadow-sm">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={activeTab === 'KE' ? (i === chartData.length-1 ? '#3b82f6' : '#e2e8f0') : (i === chartData.length-1 ? '#22c55e' : '#dcfce7')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bento-card p-8 bg-white border-slate-200 shadow-sm">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke={activeTab === 'KE' ? "#3b82f6" : "#22c55e"} strokeWidth={3} dot={{ fill: activeTab === 'KE' ? "#3b82f6" : "#22c55e", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
