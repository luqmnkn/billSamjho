import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  Zap, 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  Flame, 
  TrendingUp,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { translations } from '../translations.ts';
import { Tooltip } from 'react-tooltip';
import { tooltipDefinitions } from '../lib/tooltips.ts';

interface BillPreviewProps {
  data: any;
  onSave: () => void;
  onBack: () => void;
  isLoading?: boolean;
  hideSave?: boolean;
  userAppliances?: any;
}

export default function BillPreview({ data, onSave, onBack, isLoading, hideSave, userAppliances }: BillPreviewProps) {
  const { language } = useLanguage();
  const t = translations;
  const isSSGC = data.bill_type === 'SSGC';
  const accentColor = isSSGC ? '#22C55E' : '#2563EB';

  const getTooltipKey = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fca')) return 'fca';
    if (n.includes('mdi')) return 'mdi';
    if (n.includes('unit')) return 'units';
    if (n.includes('slab')) return 'slab';
    if (n.includes('phl')) return 'phl';
    if (n.includes('muct')) return 'muct';
    if (n.includes('tvl')) return 'tvl';
    if (n.includes('mmbtu')) return 'mmbtu';
    if (n.includes('gcv')) return 'gcv';
    if (n.includes('cms')) return 'cms';
    if (n.includes('wht')) return 'wht';
    return null;
  };
  
  // SSGC Explanations (Part 3 Logic)
  const getSSGCExplanations = () => [
    { name: 'Gas Charges', en: 'Core charge for your gas usage.', ur: `آپ نے ${data.measured_qty_cms} CMs گیس استعمال کی — یہ اس کا بنیادی خرچہ ہے` },
    { name: 'MMBTU', en: 'Meter measures CMs but bill is in MMBTU (Energy Units).', ur: 'میٹر CMs ناپتا ہے لیکن بل MMBTU میں آتا ہے — GCV اس کو convert کرتا ہے' },
    { name: 'GCV', en: 'Gas Calorific Value - Energy per cubic foot.', ur: 'Gas Calorific Value = ہر cubic foot میں کتنی توانائی — یہ ہر مہینے بدلتی ہے' },
    { name: 'Fixed Charges', en: 'Mandatory monthly network charge.', ur: `یہ Rs. ${data.fixed_charges?.toLocaleString()} چاہے گیس استعمال کریں یا نہ کریں — ہر مہینے لازمی` },
    { name: 'Meter Rent', en: 'Rent for the physical gas meter.', ur: 'آپ کے گیس میٹر کا کرایہ — صرف Rs. 40' },
    { name: 'GST Standard', en: '25% Sales tax collected for FBR.', ur: '25% سیلز ٹیکس — FBR کو جاتا ہے، SSGC کو نہیں' },
    { name: 'WHT', en: 'Withholding Tax - Waived if CNIC is registered.', ur: 'Withholding Tax — CNIC رجسٹرڈ ہے تو معاف ہے ✅' },
    { name: 'Late Surcharge', en: '10% penalty for late payments.', ur: 'آخری تاریخ کے بعد 10% جرمانہ' },
    { name: 'Gas Supply Deposit', en: 'Security deposit held by SSGC.', ur: `SSGC نے آپ کے Rs. ${data.gas_supply_deposit?.toLocaleString()} بطور ضمانت رکھے ہیں` }
  ];

  const charges = isSSGC ? getSSGCExplanations().filter(e => data[e.name.toLowerCase().replace(/ /g, '_')] > 0 || e.name === 'Gas Charges') : data.charges;
  const isAnomaly = data.total_amount > 15000 || data.units_consumed > 400 || data.measured_qty_cms > 200;

  // Chart Data Preparation
  const chargesData = isSSGC 
    ? charges.map(c => ({ name: c.name, amount: data[c.name.toLowerCase().replace(/ /g, '_')] || 0 }))
    : data.charges?.map((c: any) => ({ name: c.name, amount: c.amount || 0 })) || [];

  const getApplianceData = () => {
    if (!userAppliances) return [];
    const units = isSSGC ? data.measured_qty_cms : data.units_consumed;
    if (!units) return [];
    
    // Using estimation logic from Overview but more complete for pie chart
    const items = [];
    if (userAppliances.ac > 0) items.push({ name: 'AC', value: Math.round(userAppliances.ac * 1.5 * 8 * 30) });
    if (userAppliances.refrigerator) items.push({ name: 'Fridge', value: 60 });
    if (userAppliances.fans > 0) items.push({ name: 'Fans', value: Math.round(userAppliances.fans * 0.1 * 18 * 30) });
    
    const totalAppUnits = items.reduce((sum, item) => sum + item.value, 0);
    const others = Math.max(0, units - totalAppUnits);
    if (others > 0) items.push({ name: 'Others', value: Math.round(others) });
    
    return items;
  };

  const applianceData = getApplianceData();
  const COLORS = [accentColor, '#F5A623', '#8B5CF6', '#94A3B8'];

  const historyData = data.monthly_history?.map((h: any) => ({
    month: h.month,
    units: h.units
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl mx-auto space-y-8 pb-20"
    >
      <Tooltip id="preview-tooltip" style={{ borderRadius: '12px', fontSize: '11px', maxWidth: '200px', zIndex: 100 }} />
      {/* Header Card */}
      <div className={cn(
        "flex flex-col md:flex-row justify-between items-center p-8 rounded-[2.5rem] border transition-colors shadow-sm",
        isSSGC ? "bg-green-50 border-green-100" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center",
            isSSGC ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
          )}>
            {isSSGC ? <Flame size={32} className="fill-current" /> : <Zap size={32} className="fill-current" />}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">{isSSGC ? 'SSGC Gas' : 'KE Electricity'}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
              {isSSGC ? 'Customer' : 'Consumer'} No: <span className="font-mono text-slate-900 ml-1">{isSSGC ? data.customer_no : data.consumer_no}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.totalBill[language]}</p>
          <p className={cn("text-5xl font-black", isSSGC ? "text-green-600" : "text-blue-600")}>Rs. {(data.payable_within_due_date || data.total_amount).toLocaleString()}</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charges Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <BarChartIcon size={16} /> Charges Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chargesData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill={accentColor} radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appliance Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <PieChartIcon size={16} /> Appliance Consumption
          </h3>
          <div className="h-[300px] w-full">
            {applianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applianceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {applianceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                    No appliance data available for breakdown.
                </div>
            )}
          </div>
        </div>

        {/* Usage Line Chart (Full Width) */}
        {historyData.length > 0 && (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <LineChartIcon size={16} /> 12-Month Usage Trend
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94A3B8" />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="units" 
                    stroke={accentColor} 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: accentColor, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Explanations List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter text-slate-900">
            <Info size={20} className={isSSGC ? "text-green-600" : "text-blue-600"} />
            Charge Breakdown & Explanations
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Smart Sense v1.0</span>
        </div>
        <div className="divide-y divide-slate-50">
            {(isSSGC ? (charges as any[]) : data.charges).map((charge: any, idx: number) => {
               const tooltipKey = getTooltipKey(charge.name) as keyof typeof tooltipDefinitions | null;
               const definition = tooltipKey ? tooltipDefinitions[tooltipKey][language] : null;

               return (
                <div key={idx} className="p-8 group hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h4 
                      data-tooltip-id="preview-tooltip"
                      data-tooltip-content={definition || ""}
                      className={cn(
                        "text-lg font-black tracking-tight group-hover:text-blue-600 transition-colors text-slate-900",
                        definition && "underline decoration-dotted cursor-help"
                      )}
                    >
                      {charge.name}
                    </h4>
                    <div className="text-right">
                      {charge.amount !== undefined && (
                        <p className="text-xl font-bold text-slate-900">Rs. {charge.amount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="max-w-2xl">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {isSSGC ? charge.en : charge.explanation_en}
                    </p>
                  </div>
                </div>
               );
            })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-6 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border border-slate-200"
        >
          <ArrowLeft size={20} />
          {hideSave ? t.viewDetails[language] : 'Back to Upload'}
        </button>
        {!hideSave && (
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <Zap className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                {t.saveToHistory[language]}
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
