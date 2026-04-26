import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { 
  Zap, 
  Plus,
  Search, 
  ShieldAlert, 
  Calculator, 
  BarChart3, 
  History, 
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900">
      {/* Hero & Bento Grid Section */}
      <section className="relative overflow-hidden pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 auto-rows-[120px] md:auto-rows-[150px] gap-6 relative z-10">
          
          {/* Main Hero Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-7 row-span-3 lg:row-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-center shadow-sm relative overflow-hidden group"
          >
            {/* Logos on the right */}
            <div className="absolute top-8 right-8 flex flex-col gap-6 opacity-30 group-hover:opacity-100 transition-all duration-500 hover:scale-105">
              <img src="/ke-logo.png" alt="K-Electric" className="h-16 md:h-20 object-contain drop-shadow-md" />
              <img src="/ssgc-logo.png" alt="SSGC" className="h-16 md:h-20 object-contain drop-shadow-md" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-bold mb-8 w-fit relative z-10">
              <Zap size={14} fill="currentColor" />
              <span>Made for Karachi 🇵🇰</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.95] mb-8 tracking-tighter text-slate-900 relative z-10">
              Bill Samjho.<br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">Paise Bachao.</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl mb-10 leading-relaxed max-w-lg relative z-10">
              Karachi electricity and gas bills explained. Upload your bill and discover why you're paying so much — and how to avoid costly slab traps.
            </p>
            <div className="flex flex-wrap gap-4 relative z-10">
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-600/20 hover:scale-105"
              >
                Upload Bill 
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="bg-slate-100 border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:bg-slate-200"
              >
                Live Demo
              </Link>
            </div>
          </motion.div>

          {/* Slab Trap Detector Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-6 lg:col-span-5 row-span-3 bg-white border border-slate-200 rounded-[2rem] p-8 relative overflow-hidden shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl flex items-center gap-2">🪤 <span className="tracking-tight text-slate-900">Slab Trap Detector</span></h3>
              <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-red-100">High Risk</span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-48 h-24 overflow-hidden">
                <div className="absolute w-48 h-48 border-[12px] border-slate-100 rounded-full"></div>
                <div className="absolute w-48 h-48 border-[12px] border-blue-500 rounded-full clip-path-slab"></div>
                <motion.div 
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 45 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute w-1 h-20 bg-slate-900 left-1/2 bottom-0 origin-bottom -translate-x-1/2"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-4xl font-black tracking-tighter text-slate-900">192 <span className="text-sm font-normal text-slate-400">Units</span></div>
                <div className="text-red-500 text-xs font-bold mt-2 uppercase tracking-[0.2em] flex items-center gap-1 justify-center">
                  <AlertTriangle size={12} />
                  8 Units to Slab Jump
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-6 border-t border-slate-100 text-sm text-slate-500 leading-relaxed">
              Crossing <span className="text-slate-900 font-bold">200 units</span> will increase your bill by <span className="text-red-500 font-bold">Rs. 4,200</span> instantly.
            </div>
          </motion.div>

          {/* Culprit Finder Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-6 lg:col-span-3 row-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 flex items-center justify-center rounded-xl text-green-600">
                <Zap size={20} className="fill-current" />
              </div>
              <h3 className="font-bold tracking-tight text-slate-900">Culprit Finder</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">1.5 Ton AC</span>
                  <span className="text-xs font-black text-blue-600">62%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '62%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-blue-600 h-full rounded-full" 
                  />
                </div>
              </div>
              <p className="text-[11px] leading-tight text-slate-400 mt-2 italic border-l-2 border-slate-100 pl-3 py-1">
                "Reducing AC by 1 hour saves you ~Rs. 1,100 monthly"
              </p>
            </div>
          </motion.div>

          {/* Usage Trend Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-5 lg:col-span-2 row-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold tracking-tight text-xs uppercase text-slate-400">Trend</h3>
            </div>
            <div className="flex items-end gap-1.5 h-16 mb-4">
              {[30, 45, 100, 60, 40].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className={cn(
                    "w-full rounded-md",
                    i === 2 ? "bg-blue-600" : "bg-slate-100"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Growth</span>
              <span className="text-xs font-bold text-red-500">+12%</span>
            </div>
          </motion.div>

          {/* Feature Icons Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-7 row-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 flex items-center justify-center shadow-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-2xl">
              {[
                { icon: "📝", label: "Dispute Letter" },
                { icon: "🔮", label: "Prediction" },
                { icon: "⚡", label: "Explainer" },
                { icon: "🇵🇰", label: "Urdu Support" }
              ].map((f, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">{f.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-colors">{f.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Action Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="col-span-12 row-span-1 bg-blue-600 rounded-[2rem] p-6 md:p-4 flex flex-col md:flex-row items-center justify-between px-8 md:px-12 shadow-2xl shadow-blue-600/20"
          >
             <span className="text-white font-black text-xl mb-4 md:mb-0 tracking-tight">Ready to save on your next bill?</span>
             <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-10 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all w-full md:w-auto text-center"
            >
              Understand My Bill Now →
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-20 tracking-tighter text-slate-900">Karachi's average bills are a mess.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Search className="text-blue-600" />, 
                title: "What even is FCA?", 
                desc: "Why does it change every month? We explain every complex surcharge in plain Urdu." 
              },
              { 
                icon: <History className="text-blue-600" />, 
                title: "Why the sudden jump?", 
                desc: "Did you use more, or is it a slab trap? We analyze your history to find the 'why'." 
              },
              { 
                icon: <ShieldAlert className="text-blue-600" />, 
                title: "Am I overcharged?", 
                desc: "Most people have no idea. We cross-reference rates and flag suspicious readings." 
              }
            ].map((p, i) => (
              <div key={i} className="bento-card p-10 text-left group border-slate-200">
                <div className="mb-8 p-5 bg-blue-50 rounded-2xl w-fit group-hover:bg-blue-100 transition-colors">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900">{p.title}</h3>
                <p className="text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Everything you need to beat high bills.</h2>
            <p className="text-slate-500">Smart tools designed specifically for Pakistani Karachiite consumers.</p>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: <Zap />, title: "Bill Explainer", desc: "Every charge explained in plain Urdu/English." },
              { icon: <AlertTriangle />, title: "Slab Trap Detector", desc: "Know before you cross the expensive threshold." },
              { icon: <Calculator />, title: "Appliance Culprit Finder", desc: "Which appliance is draining your wallet?" },
              { icon: <BarChart3 />, title: "Usage History", desc: "Track your consumption over 12 months." },
              { icon: <History />, title: "Next Bill Predictor", desc: "No more month-end surprises." },
              { icon: <FileText />, title: "Dispute Letter", desc: "Fight overcharging with one click generators." }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                variants={item}
                className="p-6 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all cursor-default shadow-sm"
              >
                <div className="mb-4 text-blue-600">{f.icon}</div>
                <h4 className="text-lg font-bold mb-2 text-slate-900">{f.title}</h4>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">3 simple steps to savings.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 hidden md:block" />
            {[
              { num: "01", title: "Upload Bill", desc: "Take a photo of your KE bill with your phone." },
              { num: "02", title: "AI Reads It", desc: "Gemini AI extracts every tiny detail in seconds." },
              { num: "03", title: "Get Insights", desc: "See exactly where your money is going." }
            ].map((s, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-600/20">
                  {s.num}
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-900">{s.title}</h4>
                <p className="text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
          <Zap className="absolute top-[-10%] right-[-5%] w-64 h-64 text-blue-500 opacity-20 rotate-12" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start for free. No credit card. No jargon.</h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">Join thousands of Karachi residents who are finally taking control of their utility expenses.</p>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl inline-block"
            >
              Understand My Bill Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
          <div className="mb-4 md:mb-0">&copy; 2024 Bill Samjho Technologies - Karachi, Pakistan 🇵🇰</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
