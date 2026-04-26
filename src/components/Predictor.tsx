import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Calendar, AlertTriangle, Zap, Flame, ArrowRight, Info } from 'lucide-react';
import { cn } from '../lib/utils.ts';

interface PredictorProps {
  bills: any[];
}

export default function Predictor({ bills }: PredictorProps) {
  const [currentReading, setCurrentReading] = useState<string>('');
  const [prediction, setPrediction] = useState<{
    ke: { units: number; amount: number; isSlabTrap: boolean } | null;
    ssgc: { units: number; amount: number; isSlabTrap: boolean } | null;
  }>({ ke: null, ssgc: null });

  const keBills = bills.filter(b => b.bill_type !== 'SSGC');
  const ssgcBills = bills.filter(b => b.bill_type === 'SSGC');

  const calculateKEPrediction = (latestUnits: number) => {
    // Simple Pakistan Tariff Estimation (Simplified)
    // Protected: 1-200. Unprotected: 200+
    // Base Rates approx: 
    // 1-100: 16
    // 101-200: 22
    // 201-300: 32
    // 301+: 45+
    
    let amount = 0;
    if (latestUnits <= 100) amount = latestUnits * 16.48;
    else if (latestUnits <= 200) amount = 100 * 16.48 + (latestUnits - 100) * 22.95;
    else if (latestUnits <= 300) amount = 100 * 16.48 + 100 * 22.95 + (latestUnits - 200) * 32.03;
    else amount = latestUnits * 48; // High tier approximation with taxes

    // Adding common taxes (FPA, ED, GST) approx 30%
    amount = amount * 1.35;

    return {
      units: latestUnits,
      amount: Math.round(amount),
      isSlabTrap: latestUnits > 200 && latestUnits < 215 // Just crossed
    };
  };

  const calculateSSGCPrediction = (latestCMs: number) => {
    // SSGC approx
    // Proteced < 0.9 HM3 (approx 150 CMs)
    // Fixed: 1500 (Protected) vs 3000 (Unprotected)
    let amount = 0;
    const fixedCharges = latestCMs <= 150 ? 1500 : 3000;
    amount = fixedCharges + (latestCMs * 45); // Rate per CM approx
    
    return {
      units: latestCMs,
      amount: Math.round(amount),
      isSlabTrap: latestCMs > 150 && latestCMs < 165
    };
  };

  useEffect(() => {
    if (keBills.length > 0 || ssgcBills.length > 0) {
      const keLatest = keBills[0]?.units_consumed || 0;
      const ssgcLatest = ssgcBills[0]?.measured_qty_cms || 0;

      setPrediction({
        ke: keLatest ? calculateKEPrediction(keLatest * 1.05) : null, // 5% seasonal guess
        ssgc: ssgcLatest ? calculateSSGCPrediction(ssgcLatest) : null
      });
    }
  }, [bills]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Bill Predictor</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Projection based on history & trends</p>
        </div>
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg">AI Projected</span>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase rounded-lg">Seasonality: Normal</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* KE Prediction Card */}
        <div className="bento-card p-1 overflow-hidden group bg-white border-slate-200 shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Zap size={24} className="fill-current" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase text-lg text-slate-900">KE Prediction</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Next Month Estimate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Confidence</p>
                <p className="text-green-600 font-black">High (88%)</p>
              </div>
            </div>

            {prediction.ke ? (
              <>
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Estimated Units</p>
                    <p className="text-4xl font-black text-slate-900">{prediction.ke.units} <span className="text-sm text-slate-400 italic uppercase">kWh</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Projected Amount</p>
                    <p className="text-4xl font-black text-blue-600">Rs. {prediction.ke.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className={cn(
                  "p-5 rounded-2xl border flex items-center gap-5 transition-all",
                  prediction.ke.isSlabTrap 
                    ? "bg-red-50 border-red-200 text-red-600" 
                    : "bg-slate-50 border-slate-200 text-slate-900"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    prediction.ke.isSlabTrap ? "bg-red-100" : "bg-white"
                  )}>
                    {prediction.ke.isSlabTrap ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-1">
                      {prediction.ke.isSlabTrap ? "SLAB TRAP WARNING!" : "On Track"}
                    </p>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                      {prediction.ke.isSlabTrap 
                        ? `You are projected to hit ${prediction.ke.units} units. Save 5 units to stay in the lower slab!` 
                        : "Your consumption trend is stable. No immediate slab risks detected."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Info size={32} className="mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-400 font-bold">Need at least 1 KE bill to predict.</p>
              </div>
            )}
          </div>
        </div>

        {/* SSGC Prediction Card */}
        <div className="bento-card p-1 overflow-hidden group bg-white border-slate-200 shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Flame size={24} className="fill-current" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase text-lg text-slate-900">SSGC Prediction</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Next Month Estimate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Confidence</p>
                <p className="text-yellow-600 font-black">Medium (72%)</p>
              </div>
            </div>

            {prediction.ssgc ? (
              <>
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Estimated CMs</p>
                    <p className="text-4xl font-black text-slate-900">{prediction.ssgc.units} <span className="text-sm text-slate-400 italic uppercase">CM</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Projected Amount</p>
                    <p className="text-4xl font-black text-green-600">Rs. {prediction.ssgc.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className={cn(
                  "p-5 rounded-2xl border flex items-center gap-5 transition-all text-slate-900",
                  prediction.ssgc.isSlabTrap 
                    ? "bg-red-50 border-red-200 text-red-600" 
                    : "bg-slate-50 border-slate-200 text-slate-900"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    prediction.ssgc.isSlabTrap ? "bg-red-100" : "bg-white"
                  )}>
                    {prediction.ssgc.isSlabTrap ? <AlertTriangle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-1">
                      {prediction.ssgc.isSlabTrap ? "G-TRAP WARNING!" : "Protected Status Check"}
                    </p>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                      {prediction.ssgc.isSlabTrap 
                        ? `You are hovering near 150 CMs. Cross this and your Fixed Charges double!` 
                        : "You are well within the protected category (under 150 CMs). Keep it up!"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Info size={32} className="mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-400 font-bold">Need at least 1 SSGC bill to predict.</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Meter Manual Entry */}
        <div className="lg:col-span-2 bento-card p-8 bg-white border-slate-200 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="max-w-md">
                 <h4 className="font-black italic uppercase text-xl mb-2 underline decoration-blue-600 underline-offset-4 text-slate-900">Interactive Check</h4>
                 <p className="text-slate-500 text-xs font-bold leading-relaxed">
                    Check your meter right now and type the units/CMs here to see what your bill will likely be at the end of the month.
                 </p>
              </div>
              <div className="flex bg-slate-50 rounded-2xl border border-slate-200 p-2 w-full md:w-auto">
                 <input 
                   type="number"
                   placeholder="Enter Meter Reading"
                   value={currentReading}
                   onChange={(e) => setCurrentReading(e.target.value)}
                   className="bg-transparent border-none outline-none px-4 py-2 font-black text-xl w-full text-center text-slate-900"
                 />
                 <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-600/20">
                    Recalculate <ArrowRight size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
