import { useLanguage } from '../context/LanguageContext.tsx';
import { cn } from '../lib/utils.ts';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-slate-200">
      <button
        onClick={() => setLanguage('english')}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
          language === 'english' 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
            : "text-slate-500 hover:text-slate-900"
        )}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('roman')}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
          language === 'roman' 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
            : "text-slate-500 hover:text-slate-900"
        )}
      >
        Roman Urdu
      </button>
    </div>
  );
}
