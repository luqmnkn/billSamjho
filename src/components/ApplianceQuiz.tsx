import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { 
  Check, 
  Plus, 
  Minus, 
  Wind, 
  Snowflake, 
  WashingMachine, 
  ChevronRight, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ApplianceQuizProps {
  onComplete: (data: any) => void;
}

export default function ApplianceQuiz({ onComplete }: ApplianceQuizProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    refrigerator: false,
    fans: 0,
    ac: 0,
    washing_machine: false,
    iron: false,
    microwave: false,
  });

  const steps = [
    {
      id: 'refrigerator',
      title: 'Do you have a Fridge?',
      description: 'The backbone of every Karachi home.',
      icon: <div className="text-6xl mb-2">🧊</div>,
      type: 'boolean',
      bg: 'bg-cyan-50'
    },
    {
      id: 'fans',
      title: 'How many Fans?',
      description: 'Ceiling fans run 24/7 in summer.',
      icon: <div className="text-6xl mb-2">🌀</div>,
      type: 'number',
      bg: 'bg-blue-50'
    },
    {
      id: 'ac',
      title: 'Number of ACs?',
      description: 'The 1-ton or 1.5-ton energy eaters.',
      icon: <div className="text-6xl mb-2">❄️</div>,
      type: 'number',
      bg: 'bg-indigo-50'
    },
    {
      id: 'extras',
      title: 'Other Heavy Loads?',
      description: 'Select anything else you use.',
      type: 'checklist',
      bg: 'bg-slate-50'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleToggle = (id: string) => {
    setData(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  const handleCount = (id: string, delta: number) => {
    setData(prev => ({ 
      ...prev, 
      [id]: Math.max(0, (prev[id as keyof typeof prev] as number) + delta) 
    }));
  };

  const currentStep = steps[step];

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            className="h-full bg-blue-600"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              {currentStep.icon && (
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  {currentStep.icon}
                </div>
              )}
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{currentStep.title}</h2>
              <p className="text-slate-500 font-medium">{currentStep.description}</p>
            </div>

            <div className="py-8">
              {currentStep.type === 'boolean' && (
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => { setData(prev => ({ ...prev, [currentStep.id]: true })); handleNext(); }}
                    className={cn(
                      "group relative px-8 py-12 rounded-[2rem] border-2 transition-all w-48 flex flex-col items-center gap-4",
                      data[currentStep.id as keyof typeof data] === true 
                        ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10" 
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2",
                      data[currentStep.id as keyof typeof data] === true 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-slate-200 text-transparent"
                    )}>
                      <Check size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 uppercase tracking-widest text-sm">Yes</span>
                  </button>
                  <button
                    onClick={() => { setData(prev => ({ ...prev, [currentStep.id]: false })); handleNext(); }}
                    className={cn(
                      "group relative px-8 py-12 rounded-[2rem] border-2 transition-all w-48 flex flex-col items-center gap-4",
                      data[currentStep.id as keyof typeof data] === false 
                        ? "border-slate-400 bg-slate-50" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-200 text-transparent"
                    )}>
                      <Check size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 uppercase tracking-widest text-sm">No</span>
                  </button>
                </div>
              )}

              {currentStep.type === 'number' && (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-12">
                    <button
                      onClick={() => handleCount(currentStep.id, -1)}
                      className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                      <Minus size={24} />
                    </button>
                    <span className="text-7xl font-black italic tracking-tighter text-slate-900 w-24 text-center">
                      {data[currentStep.id as keyof typeof data]}
                    </span>
                    <button
                      onClick={() => handleCount(currentStep.id, 1)}
                      className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {currentStep.type === 'checklist' && (
                <div className="space-y-4">
                  {[
                    { id: 'washing_machine', label: 'Washing Machine', icon: <WashingMachine size={20} /> },
                    { id: 'iron', label: 'Iron (Istri)', icon: <Zap size={20} /> },
                    { id: 'microwave', label: 'Microwave', icon: <Sparkles size={20} /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all",
                        data[item.id as keyof typeof data]
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          data[item.id as keyof typeof data] ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {item.icon}
                        </div>
                        <span className="font-black italic uppercase tracking-tight text-slate-900">{item.label}</span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                        data[item.id as keyof typeof data] ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200"
                      )}>
                        {data[item.id as keyof typeof data] && <Check size={14} />}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleNext}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Finish Setup <Check size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
