import { motion } from 'motion/react';
import { Zap, Flame, AlertTriangle, TrendingDown, Info, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { translations } from '../translations.ts';

import { Tooltip } from 'react-tooltip';
import { tooltipDefinitions } from '../lib/tooltips.ts';

interface BillOverviewProps {
  data: any;
  userAppliances: any;
  onViewDetails: () => void;
  onBack: () => void;
  onAddAppliances: () => void;
}

export default function BillOverview({ data, userAppliances, onViewDetails, onBack, onAddAppliances }: BillOverviewProps) {
  const { language } = useLanguage();
  const t = translations;
  const isSSGC = data.bill_type === 'SSGC';
  
  // Logic for Slab Trap Alert
  const units = isSSGC ? data.measured_qty_cms : data.units_consumed;
  const isNearSlab = !isSSGC && units > 270 && units < 300;
  const crossed150 = isSSGC && units > 150;
  const unitsRemaining = !isSSGC ? (300 - units) : (150 - units);

  // Logic for Culprits (Deeply solved calculation)
  const getCulprits = () => {
    if (!userAppliances || !units) return null;
    
    // 1. Identify the core energy cost from the bill (excluding some fixed taxes if possible)
    const electricityCharges = data.charges?.find((c: any) => 
      c.name.toLowerCase().includes('electricity') || 
      c.name.toLowerCase().includes('variable') ||
      c.name.toLowerCase().includes('energy') ||
      c.name.toLowerCase().includes('total charges')
    )?.amount || (data.total_amount * 0.75); // Fallback to 75% for variable part

    // 2. Define appliance metadata (matching CulpritFinder)
    const applianceMetadata = [
      { id: 'ac', name: 'AC', watts: 1500, hours: 8, icon: '❄️', count: userAppliances.ac || 0 },
      { id: 'fridge', name: 'Fridge', watts: 150, hours: 24, icon: '🧊', count: userAppliances.refrigerator ? 1 : 0 },
      { id: 'fans', name: 'Fans', watts: 75, hours: 16, icon: '🌀', count: userAppliances.fans || 0 },
      { id: 'washing', name: 'Washing Machine', watts: 500, hours: 1, icon: '🧺', count: userAppliances.washing_machine ? 1 : 0 },
      { id: 'iron', name: 'Iron', watts: 1000, hours: 1, icon: '👔', count: userAppliances.iron ? 1 : 0 },
      { id: 'microwave', name: 'Microwave', watts: 1200, hours: 0.5, icon: '🍕', count: userAppliances.microwave ? 1 : 0 },
    ];

    // 3. Calculate estimated units for each
    let rawCulprits = applianceMetadata
      .filter(app => app.count > 0)
      .map(app => ({
        name: app.name,
        icon: app.icon,
        estUnits: (app.watts * app.hours * 30 * app.count) / 1000
      }));

    const totalEstUnits = rawCulprits.reduce((sum, c) => sum + c.estUnits, 0);
    
    // 4. Factor in "Other" (Lights, TV, Chargers, discrepancies)
    const billingUnits = units;
    if (billingUnits > totalEstUnits) {
       rawCulprits.push({
         name: 'Others',
         icon: '🔌',
         estUnits: billingUnits - totalEstUnits
       });
    }

    const finalTotalUnits = Math.max(totalEstUnits, billingUnits);
    
    // 5. Scale costs to match the electricityCharges
    const result = rawCulprits.map(c => {
      const share = c.estUnits / finalTotalUnits;
      return {
        name: c.name,
        cost: Math.round(share * electricityCharges),
        icon: c.icon,
        percent: Math.round(share * 100)
      };
    })
    .filter(c => c.percent > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3); // Show top 3 instead of 2 for more detail

    return result;
  };

  const culprits = getCulprits();

  const generateTips = () => {
    const tips = [];
    
    // Get appliances user actually has
    const userHasAppliances = [];
    if (userAppliances?.ac > 0) userHasAppliances.push({ name: 'AC', hours: 8, cost_per_unit: 50, consumption: 1.5 }); // Mock rates for estimation
    if (userAppliances?.fans > 0) userHasAppliances.push({ name: 'Fans', hours: 18, cost_per_unit: 50, consumption: 0.1 });
    if (userAppliances?.refrigerator) userHasAppliances.push({ name: 'Fridge', hours: 24, cost_per_unit: 50, consumption: 0.08 });

    if (userHasAppliances.length === 0) {
      return [{
        text: language === 'english' 
          ? "Add your appliances to get personalized tips" 
          : "Apne appliances add karein personalized tips ke liye",
        saving: 0,
        isLink: true
      }];
    }

    // Sort by consumption
    const sorted = userHasAppliances.sort((a, b) => b.consumption - a.consumption);
    
    const top = sorted[0];
    tips.push({
      text: language === 'english'
        ? `Reduce ${top.name} usage by 2 hours daily`
        : `${top.name} ka istemal rozana 2 ghante kam karein`,
      saving: Math.round(top.consumption * 2 * 30 * 50)
    });

    if (sorted.length > 1) {
      const second = sorted[1];
      tips.push({
        text: language === 'english'
          ? `Operate ${second.name} during off-peak hours`
          : `${second.name} ko off-peak hours mein chalayein`,
        saving: 150
      });
    }

    tips.push({
      text: language === 'english'
        ? "Use heavy appliances after 11 PM (cheaper rates)"
        : "Bhaari appliances raat 11 baje ke baad chalayein (sasti rate)",
      saving: 300
    });

    return tips.slice(0, 3);
  };

  const personalizedTips = generateTips();
  const totalSaving = personalizedTips.reduce((sum, t) => sum + t.saving, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <Tooltip id="global-tooltip" style={{ borderRadius: '12px', fontSize: '12px', maxWidth: '250px', zIndex: 50 }} />
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", isSSGC ? "bg-green-600" : "bg-blue-600")}>
               {isSSGC ? <Flame size={14} className="text-white" /> : <Zap size={14} className="text-white" />}
            </div>
            <span className="font-black tracking-tighter text-slate-900 uppercase italic">BillBolay</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Bill Card */}
      <div className={cn(
        "rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl transition-all max-w-2xl mx-auto",
        isSSGC ? "bg-green-600 text-white" : "bg-blue-600 text-white"
      )}>
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">
          {isSSGC ? 'SSGC Gas' : 'KE Electricity'} • {data.billing_month || 'Current Month'}
        </p>
        <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter mb-6">
          Rs. {(data.payable_within_due_date || data.total_amount).toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold opacity-90">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
             {t.dueDate[language]}: {data.due_date || '1st Aug'}
        </div>
      </div>

      {/* Grid Layout Fix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box 1: Alert */}
        <div className="flex flex-col h-full">
            {(!isSSGC && isNearSlab) ? (
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-50 border-2 border-amber-500/20 rounded-[2rem] p-8 flex flex-col gap-4 h-full"
            >
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                    <h4 
                      data-tooltip-id="global-tooltip"
                      data-tooltip-content={tooltipDefinitions.slab[language]}
                      className="font-black text-xs uppercase tracking-widest text-amber-600 mb-2 underline decoration-dotted cursor-help"
                    >
                      {t.slabTrapWarning[language]}
                    </h4>
                    <p className="text-lg leading-tight text-slate-900 font-bold">
                        {t.nearSlabUrdu[language].replace('{units}', unitsRemaining.toString())}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        {t.costSlabUrdu[language].replace('{units}', unitsRemaining.toString()).replace('{cost}', '1,400')}
                    </p>
                </div>
            </motion.div>
            ) : (isSSGC && crossed150) ? (
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-50 border-2 border-red-500/20 rounded-[2rem] p-8 flex flex-col gap-4 h-full"
            >
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-red-600 mb-2">LIMIT CROSSED</h4>
                    <p className="text-lg leading-tight text-slate-900 font-bold">{t.crossed150Urdu[language]}</p>
                    <p className="text-sm text-slate-500 mt-2">
                        {t.fixedChargeIssueUrdu[language].replace('{units}', Math.abs(unitsRemaining).toString())}
                    </p>
                </div>
            </motion.div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center h-full opacity-50">
                    <CheckCircle size={40} className="text-slate-300 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Alerts</p>
                </div>
            )}
        </div>

        {/* Box 2: Culprits */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-full">
            <h4 
              data-tooltip-id="global-tooltip"
              data-tooltip-content={tooltipDefinitions.culprit[language]}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 underline decoration-dotted cursor-help"
            >
                <span className="text-base font-normal no-underline">💡</span> {t.whyHigh[language]}
            </h4>
            
            {culprits ? (
            <div className="space-y-6 flex-1">
                {culprits.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                           <p className="text-lg text-slate-900 font-black">{item.name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {t.applianceCostInfo[language].replace('{percent}', item.percent.toString())}
                           </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-slate-900 text-lg">Rs. {item.cost.toLocaleString()}</p>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <div className="text-center py-6 space-y-4 flex flex-col items-center justify-center flex-1">
                <p className="text-slate-600 font-bold">{t.addAppliances[language]}</p>
                <button 
                    onClick={onAddAppliances}
                    className="bg-slate-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-200 transition-all font-sans"
                >
                    {t.addAppliances[language]}
                </button>
            </div>
            )}
        </div>

        {/* Box 3: Tips */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm overflow-hidden relative flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <TrendingDown size={100} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="text-base">✅</span> {t.whatToDo[language]}
            </h4>
            <div className="space-y-6 flex-1">
                {personalizedTips.map((tip, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                        <div className="flex-1 text-left">
                            <p className="text-base text-slate-900 font-bold leading-tight">
                                {tip.text}
                            </p>
                            {tip.saving > 0 && (
                                <p className="text-green-600 font-black text-xs mt-1 italic">💰 {t.saving[language]} Rs. {tip.saving.toLocaleString()}/month</p>
                            )}
                            {tip.isLink && (
                                <button onClick={onAddAppliances} className="text-blue-600 text-xs font-black uppercase tracking-widest mt-2 hover:underline">
                                    Start Now →
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {totalSaving > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.totalPotentialSaving[language]}</span>
                    <span className="text-xl font-black text-green-600 italic">Rs. {totalSaving.toLocaleString()}+</span>
                </div>
            )}
        </div>
      </div>

      {/* Details Button */}
      <button 
        onClick={onViewDetails}
        className="w-full max-w-2xl mx-auto bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-left px-8"
      >
        <Info size={24} />
        {t.viewDetails[language]}
        <ChevronRight size={24} className="ml-auto" />
      </button>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
