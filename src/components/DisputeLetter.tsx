import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Copy, Download, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface DisputeLetterProps {
  billData: any;
  onBack: () => void;
}

export default function DisputeLetter({ billData, onBack }: DisputeLetterProps) {
  const isSSGC = billData.bill_type === 'SSGC';
  const letterRef = useRef<HTMLDivElement>(null);

  const getDate = () => new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  const getLetterContent = () => {
    if (isSSGC) {
      return `
To,
The Billing Manager,
Sui Southern Gas Company (SSGC),
Karachi.

Date: ${getDate()}
Subject: Dispute regarding Gas Bill for Consumer No. ${billData.customer_no} (${billData.billing_month})

Respected Sir/Madam,

I am writing to formally dispute my gas bill for the month of ${billData.billing_month}. 
Upon review, I have noticed significant discrepancies:

1. High Fixed Charges: My bill shows fixed charges of Rs. ${billData.fixed_charges}, which seems incorrect compared to my usual consumption.
2. Anomaly in Reading: My current consumption of ${billData.measured_qty_cms} CMs is significantly higher than my historical average.
3. Meter Inspection Request: I suspect the meter may be faulty or there is a "Slow Meter" adjustment applied incorrectly.

I request you to:
- Re-verify the meter reading.
- Send a technical team for meter inspection.
- Revise the bill if any discrepancy is found.

I am a regular payee and hope for a quick resolution.

Sincerely,
(Your Name)
Consumer No: ${billData.customer_no}
Phone: ________________
      `;
    } else {
      return `
To,
The Manager Billing,
K-Electric (KE),
Karachi.

Date: ${getDate()}
Subject: Formal Dispute regarding Bill for Consumer No. ${billData.consumer_no} (${billData.billing_month})

Respected Sir/Madam,

I wish to register a formal dispute against the electricity bill issued for ${billData.billing_month}. My consumer number is ${billData.consumer_no}.

Following are the points of concern:
1. Slab Trap Issue: The bill has crossed the 200/300 unit threshold by a very small margin, leading to massive disproportionate taxes.
2. Unusual Units: The units consumed (${billData.units_consumed} kWh) do not align with my actual appliance usage.
3. Over-billing/Rounding: There are unexplained adjustments in the "Other Charges" section.

I request a thorough verification of my meter and a revision of this bill based on actual consumption patterns. Please provide a detailed breakdown of the Fuel Price Adjustment (FPA) applied.

Looking forward to your cooperation.

Sincerely,
(Your Name)
Consumer No: ${billData.consumer_no}
Phone: ________________
      `;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getLetterContent());
    alert('Letter copied to clipboard!');
  };

  const printLetter = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900 font-bold text-xs flex items-center gap-2 group uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Dispute Center</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Legally Optimized Draft</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div 
            ref={letterRef}
            className="bg-white text-slate-900 p-12 rounded-[2rem] shadow-2xl font-serif text-sm leading-relaxed whitespace-pre-wrap border-[12px] border-slate-100"
          >
            {getLetterContent()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bento-card p-8 bg-blue-600 text-white shadow-xl shadow-blue-600/20">
            <h4 className="font-black uppercase tracking-widest text-xs mb-4">Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={copyToClipboard}
                className="w-full bg-white/20 hover:bg-white/30 p-4 rounded-xl flex items-center gap-3 font-black transition-all"
              >
                <Copy size={20} />
                Copy Text
              </button>
              <button 
                onClick={printLetter}
                className="w-full bg-white/20 hover:bg-white/30 p-4 rounded-xl flex items-center gap-3 font-black transition-all"
              >
                <Printer size={20} />
                Print PDF
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 p-4 rounded-xl flex items-center gap-3 font-black transition-all">
                <Download size={20} />
                Save Draft
              </button>
            </div>
          </div>

          <div className="bento-card p-8 border-l-4 border-l-green-500 bg-white border-slate-200 shadow-sm text-slate-900">
            <h4 className="text-green-600 font-black uppercase tracking-widest text-[10px] mb-4">How to use this?</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs font-bold leading-relaxed text-slate-500">
                <div className="shrink-0 text-green-500"><CheckCircle2 size={16} /></div>
                Print this letter on a plain paper.
              </li>
              <li className="flex gap-3 text-xs font-bold leading-relaxed text-slate-500">
                <div className="shrink-0 text-green-500"><CheckCircle2 size={16} /></div>
                Attached a photocopy of your CNIC.
              </li>
              <li className="flex gap-3 text-xs font-bold leading-relaxed text-slate-500">
                <div className="shrink-0 text-green-500"><CheckCircle2 size={16} /></div>
                Attached a photocopy of the disputed bill.
              </li>
              <li className="flex gap-3 text-xs font-bold leading-relaxed text-slate-500">
                <div className="shrink-0 text-green-500"><CheckCircle2 size={16} /></div>
                Submit it at any {isSSGC ? 'SSGC' : 'KE'} Customer Care center.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
