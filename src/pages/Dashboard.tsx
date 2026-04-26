import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { Upload, Plus, FileText, Zap, ChevronRight, LayoutDashboard, History, PieChart, Info, Loader2, Calculator, TrendingUp, Flame, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import BillCapture from '../components/BillCapture.tsx';
import BillPreview from '../components/BillPreview.tsx';
import Trends from '../components/Trends.tsx';
import CulpritFinder from '../components/CulpritFinder.tsx';
import Predictor from '../components/Predictor.tsx';
import DisputeLetter from '../components/DisputeLetter.tsx';
import ApplianceQuiz from '../components/ApplianceQuiz.tsx';
import BillOverview from '../components/BillOverview.tsx';
import LanguageToggle from '../components/LanguageToggle.tsx';

type DashboardView = 'overview' | 'upload' | 'details' | 'history' | 'trends' | 'culprit' | 'predictor' | 'dispute' | 'quiz' | 'single_overview';

export default function Dashboard() {
  const { user, updateAppliances } = useAuth();
  const [view, setView] = useState<DashboardView>('overview');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bills', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Failed to fetch bills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractionSuccess = (data: any) => {
    setExtractedData(data);
    setSelectedBill(data);
    if (!user?.appliances) {
      setView('quiz');
    } else {
      setView('single_overview');
    }
  };

  const handleSaveBill = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...extractedData,
          extracted_data: extractedData // Raw storage
        })
      });

      if (response.ok) {
        await fetchBills();
        setView('overview');
        setExtractedData(null);
        setSelectedBill(null);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || errorData.message || 'Failed to save bill to database');
      }
    } catch (err: any) {
      console.error('Failed to save bill', err);
      setSaveError(err.message || 'A network error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewBill = (bill: any) => {
    const data = bill.extracted_data || bill;
    // Ensure all fields are there if it's the top level
    const fullData = {
      ...data,
      consumer_no: data.consumer_no || bill.consumer_no,
      billing_month: data.billing_month || bill.billing_month,
      total_amount: data.total_amount || bill.total_amount,
      payable_within_due_date: data.payable_within_due_date || bill.payable_within_due_date,
      units_consumed: data.units_consumed || bill.units_consumed,
      bill_type: data.bill_type || bill.bill_type
    };
    setSelectedBill(fullData);
    setExtractedData(null); // It's already saved
    setView('single_overview');
  };

  const handleQuizComplete = async (quizData: any) => {
    await updateAppliances(quizData);
    if (selectedBill) {
      setView('single_overview');
    } else {
      setView('overview');
    }
  };

  if (isLoading && bills.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[#F8FAFC] text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        {!user?.appliances && view !== 'quiz' && (
          <div className="mb-8 p-6 bg-blue-600 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-600/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <Sparkles size={24} />
              </div>
              <div className="text-left">
                <h4 className="text-white font-black italic uppercase tracking-tight">Complete your profile for better analysis</h4>
                <p className="text-white/70 text-xs font-bold">Help us identify slab traps by telling us what appliances you use.</p>
              </div>
            </div>
            <button 
              onClick={() => setView('quiz')}
              className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Start Quiz
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-12 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar shadow-sm">
          <button 
            onClick={() => setView('overview')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
              view === 'overview' || view === 'details' || view === 'single_overview' ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <LayoutDashboard size={14} />
            Overview
          </button>
          <button 
            disabled={bills.length === 0}
            onClick={() => setView('trends')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
              view === 'trends' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-900",
              bills.length === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <TrendingUp size={14} />
            Trends
          </button>
          <button 
            disabled={bills.length === 0}
            onClick={() => setView('predictor')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
              view === 'predictor' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-900",
              bills.length === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <Brain size={14} />
            Predictor
          </button>
          <button 
            onClick={() => setView('culprit')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
              view === 'culprit' ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Calculator size={14} />
            Culprit Finder
          </button>
          <button 
            onClick={() => setView('history')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 whitespace-nowrap",
              view === 'history' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <History size={14} />
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-black mb-2 tracking-tighter italic uppercase underline decoration-blue-600 underline-offset-8 text-slate-900">Welcome, {user?.name}!</h1>
                  <p className="text-slate-400 mt-4 font-medium uppercase tracking-[0.2em] text-[10px]">Your Energy Command Center</p>
                </div>
                <div className="flex items-center gap-4">
                   <LanguageToggle />
                   <button 
                    onClick={() => setView('upload')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
                   >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>Analyze New Bill</span>
                   </button>
                </div>
              </div>

              {bills.length === 0 ? (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div 
                      onClick={() => setView('upload')}
                      className="bg-white border-3 border-dashed border-slate-200 rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-600/30 transition-all active:scale-[0.99] shadow-sm"
                    >
                      <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-100 transition-colors">
                        <Upload size={48} className="text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-slate-900">Analyze your first bill</h3>
                      <p className="text-slate-500 max-w-sm mb-10 leading-relaxed text-lg font-medium">
                        Take a photo or upload an image of your KE or SSGC bill. Gemini AI will analyze it in seconds.
                      </p>
                      <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl">
                        Get Started
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bento-card p-8 border-slate-200">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                          <Zap size={24} className="fill-current" />
                        </div>
                        <h4 className="font-black text-lg tracking-tight uppercase tracking-widest text-blue-600">Quick Status</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">KE Account</span>
                          <span className="font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-900">{user?.consumer_no_ke?.substring(0,6) || 'NOT LINKED'}</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Bills Analyzed</span>
                          <span className="font-black text-2xl text-slate-900">{bills.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bento-card p-8 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden group border-none shadow-blue-600/20">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
                        <Brain size={120} />
                      </div>
                      <h4 className="font-black mb-6 tracking-tight uppercase text-sm tracking-[0.2em] text-white">AI Recommendation</h4>
                      <p className="text-sm text-white/80 leading-relaxed font-bold relative z-10">
                        We detect your patterns across both Gas and Electricity to find hidden savings. Upload 3 months of history for full accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-4 gap-6">
                  <div className="bento-card p-6 border-l-4 border-l-blue-600 border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Average Exp</p>
                    <p className="text-3xl font-black text-slate-900">Rs. {Math.floor(bills.reduce((acc, b) => acc + (b.total_amount || b.payable_within_due_date || 0), 0) / bills.length).toLocaleString()}</p>
                  </div>
                  <div className="bento-card p-6 border-l-4 border-l-green-500 border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Analyzed</p>
                    <p className="text-3xl font-black text-slate-900">{bills.length} <span className="text-sm font-bold text-slate-400">Bills</span></p>
                  </div>
                  
                  {/* Household Summary Card (Combined KE & SSGC) */}
                  <div className="bento-card p-6 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-transparent border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Household Burn</p>
                    <p className="text-3xl font-black text-slate-900">Rs. {
                      (() => {
                        const latestKE = bills.find(b => b.bill_type !== 'SSGC');
                        const latestSSGC = bills.find(b => b.bill_type === 'SSGC');
                        return ((latestKE?.total_amount || latestKE?.payable_within_due_date || 0) + 
                                (latestSSGC?.total_amount || latestSSGC?.payable_within_due_date || 0)).toLocaleString();
                      })()
                    }</p>
                  </div>

                  <div className="bento-card p-6 flex items-center justify-center bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 border-none" onClick={() => setView('upload')}>
                    <div className="text-center">
                      <Upload className="mx-auto mb-1" />
                      <p className="font-black text-[10px] uppercase tracking-widest">New Analysis</p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Recent Multi-Utility History</h3>
                      <button onClick={() => setView('history')} className="text-blue-600 font-bold text-xs tracking-widest uppercase hover:underline">View All &rarr;</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="pb-4 px-4 text-left">Type</th>
                            <th className="pb-4 px-4 text-left">Month</th>
                            <th className="pb-4 px-4 text-left">Consumption</th>
                            <th className="pb-4 px-4 text-left">Amount</th>
                            <th className="pb-4 px-4 text-left">Audit</th>
                            <th className="pb-4 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bills.slice(0, 5).map((bill) => (
                            <tr key={bill._id} className="group hover:bg-slate-50 transition-colors">
                              <td className="py-6 px-4">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  bill.bill_type === 'SSGC' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                )}>
                                  {bill.bill_type === 'SSGC' ? <Flame size={18} /> : <Zap size={18} />}
                                </div>
                              </td>
                              <td className="py-6 px-4 font-black capitalize text-slate-900">{bill.billing_month}</td>
                              <td className="py-6 px-4 font-mono text-slate-700">{bill.units_consumed || bill.measured_qty_cms} {bill.bill_type === 'SSGC' ? 'CM' : 'kWh'}</td>
                              <td className="py-6 px-4 font-black text-slate-900">Rs. {(bill.total_amount || bill.payable_within_due_date)?.toLocaleString()}</td>
                              <td className="py-6 px-4">
                                <span className={cn(
                                  "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                  (bill.extracted_data?.is_slab_trap || bill.measured_qty_cms > 150) ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                )}>
                                  {(bill.extracted_data?.is_slab_trap || bill.measured_qty_cms > 150) ? "Critical" : "Clean"}
                                </span>
                              </td>
                              <td className="py-6 px-4 text-right">
                                <button 
                                  onClick={() => handleViewBill(bill)}
                                  className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent"
                                >
                                  <ChevronRight size={20} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <button 
                  onClick={() => setView('overview')}
                  className="text-slate-400 hover:text-slate-900 font-bold text-xs flex items-center gap-2 group uppercase tracking-widest"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="text-right">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Carbon Capture</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Image Analysis Mode</p>
                </div>
              </div>
              <BillCapture onSuccess={handleExtractionSuccess} />
            </motion.div>
          )}

          {view === 'single_overview' && selectedBill && (
            <motion.div
              key="single_overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BillOverview 
                data={selectedBill} 
                userAppliances={user?.appliances}
                onViewDetails={() => setView('details')}
                onAddAppliances={() => setView('quiz')}
                onBack={() => {
                  setView('overview');
                  setSelectedBill(null);
                  setExtractedData(null);
                }}
              />
              
              {extractedData && (
                <div className="max-w-md mx-auto mt-6 space-y-4">
                  {saveError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
                    >
                      <ShieldAlert size={20} className="shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest">Database Error</p>
                        <p className="text-xs font-medium opacity-80">{saveError}</p>
                      </div>
                    </motion.div>
                  )}
                  <button 
                    onClick={handleSaveBill}
                    disabled={isSaving}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-600/20 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                    Save this bill to history
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'details' && selectedBill && (
            <div className="space-y-6">
              {saveError && (
                <div className="max-w-5xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 mb-4"
                  >
                    <ShieldAlert size={20} className="shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Database Error</p>
                      <p className="text-xs font-medium opacity-80">{saveError}</p>
                    </div>
                  </motion.div>
                </div>
              )}
              <BillPreview 
                data={selectedBill} 
                onSave={handleSaveBill} 
                onBack={() => setView('single_overview')}
                isLoading={isSaving}
                hideSave={!extractedData}
                userAppliances={user?.appliances}
              />
              {selectedBill && (
                <div className="max-w-4xl mx-auto">
                   <button 
                     onClick={() => setView('dispute')}
                     className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 p-6 rounded-[2rem] flex items-center justify-between group transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#EF4444]/20 rounded-xl flex items-center justify-center">
                            <ShieldAlert size={24} />
                         </div>
                         <div className="text-left">
                            <h4 className="font-black italic uppercase tracking-tight">Something wrong with this bill?</h4>
                            <p className="text-xs font-bold opacity-70">Generate a formal dispute letter for {selectedBill.bill_type === 'SSGC' ? 'SSGC' : 'KE'} in 1-click.</p>
                         </div>
                      </div>
                      <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                   </button>
                </div>
              )}
            </div>
          )}

          {view === 'trends' && (
             <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
             >
               <Trends bills={bills} />
             </motion.div>
          )}

          {view === 'predictor' && (
             <motion.div
              key="predictor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
             >
               <Predictor bills={bills} />
             </motion.div>
          )}

          {view === 'culprit' && (
             <motion.div
              key="culprit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
             >
               <CulpritFinder />
             </motion.div>
          )}

          {view === 'dispute' && selectedBill && (
            <DisputeLetter billData={selectedBill} onBack={() => setView('details')} />
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Analysis History</h2>
                <button 
                  onClick={() => setView('upload')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                  + New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bills.map((bill) => (
                  <div 
                    key={bill._id} 
                    onClick={() => handleViewBill(bill)}
                    className="bento-card p-8 group hover:border-blue-600/50 transition-all cursor-pointer relative overflow-hidden bg-white border-slate-200 shadow-sm"
                  >
                    <div className="absolute top-0 right-0 p-2">
                       <span className={cn(
                        "text-[8px] font-black px-2 py-1 rounded-full uppercase",
                        (bill.extracted_data?.is_slab_trap || bill.measured_qty_cms > 150) ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        {(bill.extracted_data?.is_slab_trap || bill.measured_qty_cms > 150) ? "Critical" : "Optimal"}
                       </span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{bill.billing_month}</p>
                        <h4 className="text-2xl font-black italic tracking-tight underline decoration-blue-200 group-hover:decoration-blue-600 transition-all text-slate-900">
                          {bill.bill_type === 'SSGC' ? 'SSGC Gas' : 'KE Electricity'}
                        </h4>
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        bill.bill_type === 'SSGC' 
                          ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white" 
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      )}>
                        {bill.bill_type === 'SSGC' ? <Flame size={24} /> : <Zap size={24} />}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-slate-400">{bill.bill_type === 'SSGC' ? 'CMs' : 'Units'}</span>
                        <span className="text-slate-900">{bill.bill_type === 'SSGC' ? bill.measured_qty_cms : bill.units_consumed} {bill.bill_type === 'SSGC' ? 'CM' : 'kWh'}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black italic">
                        <span className="text-slate-400">Amount</span>
                        <span className={cn(bill.bill_type === 'SSGC' ? "text-green-600" : "text-blue-600")}>
                          Rs. {(bill.payable_within_due_date || bill.total_amount || 0)?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ApplianceQuiz onComplete={handleQuizComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowLeft({ size, className }: { size: number, className?: string }) {
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
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
