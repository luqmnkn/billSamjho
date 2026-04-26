import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, TrendingDown, Info } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Tooltip } from 'react-tooltip';
import { tooltipDefinitions } from '../lib/tooltips.ts';

interface SlabMeterProps {
  units: number;
  type: 'KE' | 'SSGC';
}

export default function SlabMeter({ units, type }: SlabMeterProps) {
  const isKE = type === 'KE';
  const { language } = useLanguage();

  // KE Thresholds: 100, 200, 300, 700
  // SSGC Threshold: 150
  const thresholds = isKE ? [100, 200, 300, 700] : [150, 200, 300];
  const currentThreshold = thresholds.find(t => t > units) || thresholds[thresholds.length - 1];
  const remaining = currentThreshold - units;
  const percentage = Math.min(100, (units / currentThreshold) * 100);

  const getTip = () => {
    if (isKE) {
      if (remaining < 20) return `آپ ${units} یونٹ پر ہیں — ${remaining} یونٹ اور تو Rs. 1,400 زیادہ بل آئے گا`;
      return "آپ فی الحال محفوظ زون میں ہیں۔";
    } else {
      if (units > 150) return `آپ نے 150 سے ${Math.round(units - 150)} CMs زیادہ استعمال کیے — Fixed Charge Rs. 1,500 سے Rs. 3,000 ہو گیا!`;
      if (remaining < 15) return `احتیاط! صرف ${Math.round(remaining)} CMs اور تو Rs. 1,500 کا اضافی بوجھ پڑے گا۔`;
      return "بہترین! آپ پروٹیکٹڈ ٹیرف میں ہیں۔";
    }
  };

  return (
    <div className={cn(
      "bento-card p-8 border-l-4",
      remaining < 20 ? "border-l-[#EF4444] bg-[#EF4444]/5" : "border-l-[#22C55E] bg-[#22C55E]/5"
    )}>
      <Tooltip id="slab-tooltip" style={{ borderRadius: '12px', fontSize: '11px', maxWidth: '200px', zIndex: 100 }} />
      <div className="flex justify-between items-start mb-6">
         <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              remaining < 20 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#22C55E]/10 text-[#22C55E]"
            )}>
              {remaining < 20 ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <h4 
                data-tooltip-id="slab-tooltip"
                data-tooltip-content={tooltipDefinitions.slab[language]}
                className="font-black uppercase tracking-widest text-xs underline decoration-dotted cursor-help"
              >
                {isKE ? 'Electricity' : 'Gas'} Slab Monitor
              </h4>
              <p className="text-[10px] font-bold text-[#7A8BA8] uppercase tracking-[0.2em] mt-1">Real-time Slab Tracking</p>
            </div>
         </div>
         <div className="text-right">
            <p 
              data-tooltip-id="slab-tooltip"
              data-tooltip-content={tooltipDefinitions[isKE ? 'units' : 'cms'][language]}
              className="text-2xl font-black italic underline decoration-dotted cursor-help"
            >
              {units} <span className="text-xs font-normal text-[#7A8BA8]">{isKE ? 'kWh' : 'CM'}</span>
            </p>
         </div>
      </div>

      <div className="relative h-4 bg-[#0A1628] rounded-full overflow-hidden mb-6 border border-[#1E3050]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-colors",
            percentage > 90 ? "bg-[#EF4444]" : percentage > 70 ? "bg-[#F5A623]" : "bg-[#22C55E]"
          )}
        />
        {isKE && (
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
            <div className="h-full w-px bg-white/10" style={{ left: '14%' }}></div>
            <div className="h-full w-px bg-white/20" style={{ left: '28%' }}></div>
            <div className="h-full w-px bg-white/30" style={{ left: '42%' }}></div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#7A8BA8] mb-8">
        <span>0</span>
        {isKE ? (
          <>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span className="text-[#EF4444]">700+</span>
          </>
        ) : (
          <>
            <span>150</span>
            <span>200</span>
            <span className="text-[#EF4444]">300+</span>
          </>
        )}
      </div>

      <div className="p-4 bg-[#111D35] rounded-2xl border border-[#1E3050] flex gap-4 items-center">
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          remaining < 20 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#22C55E]/10 text-[#22C55E]"
        )}>
          <TrendingDown size={16} />
        </div>
        <p className="text-sm font-bold leading-relaxed">{getTip()}</p>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-[#0A1628]/50 rounded-xl border border-[#1E3050]/50">
        <Info size={14} className="text-[#F5A623] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#7A8BA8] leading-relaxed font-medium">
          {isKE 
           ? "Karachi's electricity rates jump nearly Rs. 8/unit when you cross the 200 unit mark. This applies to your ENTIRE consumption, not just the extra units."
           : "SSGC's fixed charges double from Rs. 1,500 to Rs. 3,000 if you cross 150 CMs. This is the single biggest cause of 'gas bill jumps' in Karachi."
          }
        </p>
      </div>
    </div>
  );
}
