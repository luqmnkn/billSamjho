import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, Loader2, X, CheckCircle2, AlertCircle, Info, Zap, Flame } from 'lucide-react';
import { extractBillData, extractSSGCBill } from '../services/geminiService.ts';
import { cn } from '../lib/utils.ts';

interface BillCaptureProps {
  onSuccess: (data: any) => void;
}

export default function BillCapture({ onSuccess }: BillCaptureProps) {
  const [billType, setBillType] = useState<'KE' | 'SSGC'>('KE');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large. Please upload an image under 5MB.');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!preview) return;
    
    setIsExtracting(true);
    setError(null);
    setStatusMessage('Reading bill with Gemini AI...');
    
    try {
      const base64Image = preview.split(',')[1];
      const data = billType === 'KE' 
        ? await extractBillData(base64Image) 
        : await extractSSGCBill(base64Image);
      
      setStatusMessage('Analyzing charges...');
      // Simulated small delay for better UX
      await new Promise(r => setTimeout(r, 1000));
      
      onSuccess({ ...data, bill_type: billType });
    } catch (err: any) {
      setError(err.message || 'Failed to extract data. Please try a clearer photo.');
    } finally {
      setIsExtracting(false);
      setStatusMessage('');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setIsExtracting(false);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center gap-6">
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Which bill are you uploading?</p>
               <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setBillType('KE')}
                    className={cn(
                      "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                      billType === 'KE' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Zap size={14} className={cn(billType === 'KE' && "fill-current")} />
                    KE Electricity
                  </button>
                  <button 
                    onClick={() => setBillType('SSGC')}
                    className={cn(
                      "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                      billType === 'SSGC' ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Flame size={14} className={cn(billType === 'SSGC' && "fill-current")} />
                    SSGC Gas
                  </button>
               </div>
            </div>

            <div
              className={cn(
                "bg-white border-3 border-dashed rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center justify-center text-center group cursor-pointer transition-all shadow-sm",
                billType === 'KE' ? "border-slate-200 hover:border-blue-600/30" : "border-slate-200 hover:border-green-500/30"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-colors",
                billType === 'KE' ? "bg-blue-50 group-hover:bg-blue-100" : "bg-green-50 group-hover:bg-green-100"
              )}>
                <Upload size={48} className={billType === 'KE' ? "text-blue-600" : "text-green-600"} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-slate-900">Upload your {billType} bill</h3>
              <p className="text-slate-500 max-w-sm mb-10 leading-relaxed text-lg font-medium">
                Take a photo or upload an image of your {billType === 'KE' ? 'K-Electric' : 'SSGC Gas'} bill.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className={cn(
                  "px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2",
                  billType === 'KE' ? "bg-slate-900 text-white" : "bg-green-600 text-white"
                )}>
                  <Upload size={18} />
                  Select Image
                </button>
                <button 
                  className="bg-slate-100 text-slate-900 px-8 py-3 rounded-2xl font-bold transition-all hover:bg-slate-200 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.setAttribute('capture', 'environment');
                    fileInputRef.current?.click();
                    fileInputRef.current?.removeAttribute('capture');
                  }}
                >
                  <Camera size={18} />
                  Camera
                </button>
              </div>
              {error && (
                <div className="mt-8 text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm"
          >
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden relative group border border-slate-100">
                <img 
                  src={preview} 
                  alt="Bill Preview" 
                  className={cn(
                    "w-full h-full object-contain transition-all",
                    isExtracting && "opacity-50 grayscale"
                  )}
                />
                {!isExtracting && (
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                {isExtracting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-4 rounded-2xl flex flex-col items-center gap-4 border border-blue-600/30 shadow-2xl">
                      <Loader2 size={40} className="text-blue-600 animate-spin" />
                      <p className="text-slate-900 font-black uppercase tracking-widest text-xs">{statusMessage}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h3 className="text-3xl font-black mb-4 tracking-tighter text-slate-900">Ready to analyze?</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Make sure the bill details (Consumer No, Charges, Units) are clearly visible in the image.
                </p>
                
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 mb-6 text-sm font-medium">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    disabled={isExtracting}
                    onClick={handleExtract}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/10 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isExtracting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Zap size={20} className="fill-current" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                  <button
                    disabled={isExtracting}
                    onClick={reset}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                  <div className="text-blue-600 pt-1">
                    <Info size={16} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gemini AI will identify all taxes, slab traps, and hidden charges to explain them in simple terms.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
