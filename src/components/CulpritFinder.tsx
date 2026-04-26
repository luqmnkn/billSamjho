import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, AlertCircle, TrendingDown, Lightbulb, ChevronRight, Calculator, Flame, User } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Tooltip } from 'react-tooltip';
import { tooltipDefinitions } from '../lib/tooltips.ts';

interface Appliance {
  id: string;
  name: string;
  watts?: number;
  cms_per_hour?: number;
  hours: number;
  count?: number;
  icon: string;
}

const ELECTRIC_APPLIANCES: Appliance[] = [
  { id: 'ac', name: '1.5 Ton AC', watts: 1500, hours: 8, icon: '❄️', count: 1 },
  { id: 'fridge', name: 'Refrigerator', watts: 150, hours: 24, icon: '🧊', count: 1 },
  { id: 'fans', name: 'Ceiling Fans', watts: 75, hours: 12, icon: '🌬️', count: 0 },
  { id: 'washing', name: 'Washing Machine', watts: 500, hours: 1, icon: '🧺', count: 1 },
  { id: 'iron', name: 'Iron', watts: 1000, hours: 1, icon: '👔', count: 1 },
  { id: 'microwave', name: 'Microwave', watts: 1200, hours: 0.5, icon: '🍕', count: 1 },
];

const GAS_APPLIANCES: Appliance[] = [
  { id: 'geyser_g', name: 'Gas Geyser', cms_per_hour: 0.8, hours: 4, icon: '♨️' },
  { id: 'stove2', name: 'Gas Stove (2-Burner)', cms_per_hour: 0.3, hours: 3, icon: '🍳' },
];

export default function CulpritFinder() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'KE' | 'SSGC'>('KE');
  const [eAppliances, setEAppliances] = useState<Appliance[]>(ELECTRIC_APPLIANCES);
  const [gAppliances, setGAppliances] = useState<Appliance[]>(GAS_APPLIANCES);
  const [unitRate, setUnitRate] = useState(45); 
  const [gasRate, setGasRate] = useState(1450);

  useEffect(() => {
    if (user?.appliances) {
      setEAppliances(prev => prev.map(app => {
        if (app.id === 'fridge') return { ...app, count: user.appliances.refrigerator ? 1 : 0 };
        if (app.id === 'fans') return { ...app, count: user.appliances.fans };
        if (app.id === 'ac') return { ...app, count: user.appliances.ac };
        if (app.id === 'washing') return { ...app, count: user.appliances.washing_machine ? 1 : 0 };
        if (app.id === 'iron') return { ...app, count: user.appliances.iron ? 1 : 0 };
        if (app.id === 'microwave') return { ...app, count: user.appliances.microwave ? 1 : 0 };
        return app;
      }).filter(app => (app.count || 0) > 0));
    }
  }, [user]);

  const calculateECost = (app: Appliance) => {
    const units = ((app.watts || 0) * app.hours * 30 * (app.count || 1)) / 1000;
    return { units, cost: units * unitRate };
  };

  const calculateGCost = (app: Appliance) => {
    const cms = (app.cms_per_hour || 0) * app.hours * 30;
    // Simplified CMS to MMBTU conversion: 1 CMS ~= 0.035 MMBTU (depends on GCV)
    const mmbtu = cms * 0.035; 
    return { cms, cost: mmbtu * gasRate };
  };

  const currentApps = activeTab === 'KE' ? eAppliances : gAppliances;
  
  const totals = currentApps.reduce((acc, app) => {
    if (activeTab === 'KE') {
      const { units, cost } = calculateECost(app);
      return { totalQty: acc.totalQty + units, totalCost: acc.totalCost + cost };
    } else {
      const { cms, cost } = calculateGCost(app);
      return { totalQty: acc.totalQty + cms, totalCost: acc.totalCost + cost };
    }
  }, { totalQty: 0, totalCost: 0 });

  const updateHours = (id: string, hours: number) => {
    const setter = activeTab === 'KE' ? setEAppliances : setGAppliances;
    setter(prev => prev.map(app => 
      app.id === id ? { ...app, hours: Math.min(24, Math.max(0, hours)) } : app
    ));
  };

  return (
    <div className="space-y-8">
      <Tooltip id="culprit-tooltip" style={{ borderRadius: '12px', fontSize: '11px', maxWidth: '200px', zIndex: 100 }} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 
            data-tooltip-id="culprit-tooltip"
            data-tooltip-content={tooltipDefinitions.culprit[language]}
            className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 underline decoration-dotted cursor-help"
          >
            Culprit Finder
          </h2>
          <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">Identify the Energy Drains in Your Home</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('KE')}
            className={cn(
              "px-6 py-2 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-2",
              activeTab === 'KE' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Zap size={14} className={activeTab === 'KE' ? "fill-current" : ""} />
            Electricity
          </button>
          <button 
            onClick={() => setActiveTab('SSGC')}
            className={cn(
              "px-6 py-2 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-2",
              activeTab === 'SSGC' ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Flame size={14} className={activeTab === 'SSGC' ? "fill-current" : ""} />
            Gas
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 px-8 py-6 rounded-[2rem] flex flex-wrap gap-8 items-center justify-between shadow-sm">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{activeTab === 'KE' ? 'Unit Rate (Rs.)' : 'Gas Rate (Rs/MMBTU)'}</p>
            <input 
              type="number" 
              value={activeTab === 'KE' ? unitRate : gasRate} 
              onChange={(e) => activeTab === 'KE' ? setUnitRate(Number(e.target.value)) : setGasRate(Number(e.target.value))}
              className={cn(
                "bg-transparent text-2xl font-black focus:outline-none w-20",
                activeTab === 'KE' ? "text-blue-600" : "text-green-600"
              )}
            />
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Estimated Total</p>
            <p className="text-2xl font-black text-slate-900">Rs. {Math.round(totals.totalCost).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Monthly Total Usage</p>
           <p className="text-2xl font-black text-slate-900">{Math.round(totals.totalQty).toLocaleString()} <span className="text-xs font-bold text-slate-400">{activeTab === 'KE' ? 'kWh' : 'CMs'}</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {currentApps.map((app) => {
            const result = activeTab === 'KE' ? calculateECost(app) : calculateGCost(app);
            const cost = result.cost;
            const qty = activeTab === 'KE' ? (result as any).units : (result as any).cms;

            return (
              <div key={app.id} className="bento-card p-6 group hover:border-blue-600/30 transition-all bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="text-3xl bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-slate-900">
                        {app.name} {(app.count || 0) > 1 && <span className="text-blue-600 text-[10px] ml-2">x{app.count}</span>}
                      </h4>
                      <p className={cn("text-sm font-black", activeTab === 'KE' ? "text-blue-600" : "text-green-600")}>Rs. {Math.round(cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{activeTab === 'KE' ? `${app.watts} Watts` : `${app.cms_per_hour} CM/Hr`}</span>
                      <span>{Math.round(qty || 0)} {activeTab === 'KE' ? 'kWh' : 'CMs'}/Mo</span>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        step="0.5"
                        value={app.hours} 
                        onChange={(e) => updateHours(app.id, Number(e.target.value))}
                        className={cn(
                          "flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden appearance-none cursor-pointer",
                          activeTab === 'KE' ? "accent-blue-600" : "accent-green-600"
                        )}
                      />
                      <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg min-w-[70px] text-center shadow-sm">
                        <span className="text-sm font-black italic text-slate-900">{app.hours}h</span>
                        <span className="text-[8px] text-slate-400 ml-1 uppercase">/day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className={cn(
            "bento-card p-8 bg-gradient-to-br relative overflow-hidden shadow-sm",
            activeTab === 'KE' ? "from-blue-600 to-blue-800 text-white" : "from-green-600 to-green-800 text-white"
          )}>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
              <Calculator size={120} />
            </div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <TrendingDown size={16} />
              Potential Savings
            </h4>
            
            <div className="space-y-6">
              {activeTab === 'KE' ? (
                <>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Impact Move</p>
                     <p className="text-sm font-bold leading-relaxed">
                       Reducing <span className="italic">AC usage</span> by 1 hour saves you <span className="text-white">Rs. {Math.round((1.5 * 30) * unitRate).toLocaleString()}</span> monthly.
                     </p>
                  </div>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-green-200 mb-1">Pro Tip</p>
                     <p className="text-sm font-bold leading-relaxed">
                       Electric geysers are the biggest hidden culprits. Switch to gas or solar for 90% savings.
                     </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-green-200 mb-1">Impact Move</p>
                     <p className="text-sm font-bold leading-relaxed">
                       Reducing <span className="italic">Gas Geyser</span> by 1 hour saves you <span className="text-white">Rs. {Math.round((0.8 * 30 * 0.035) * gasRate).toLocaleString()}</span> monthly.
                     </p>
                  </div>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-red-200 mb-1">Warning</p>
                     <p className="text-sm font-bold leading-relaxed">
                       Winter is coming. Gas heaters can push you beyond the 150 CM slab in just 4 days.
                     </p>
                  </div>
                </>
              )}
            </div>

            <button className="w-full mt-8 bg-white text-slate-900 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl">
              Save Configuration
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="bento-card p-8 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center bg-white">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
              activeTab === 'KE' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
            )}>
              <Lightbulb size={32} />
            </div>
            <h4 className="font-black italic uppercase tracking-tighter text-lg mb-2 text-slate-900">Smart Strategy</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {activeTab === 'KE' 
                ? "Running heavy machinery during off-peak hours (11 PM onwards) can reduce your fixed taxes."
                : "Insulating your gas geyser pipes can save up to 15% in gas volume by retaining heat longer."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
