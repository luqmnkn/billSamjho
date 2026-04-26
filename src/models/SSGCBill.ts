import mongoose from 'mongoose';
const { Schema } = mongoose;
import type { Document } from 'mongoose';

export interface ISSGCBill extends Document {
  user: mongoose.Types.ObjectId;
  bill_type: 'SSGC';
  customer_no: string;
  bill_ref_id: string;
  billing_month: string;
  issue_date: Date;
  due_date: Date;
  tariff_class: string;
  meter_no: string;
  curr_reading: number;
  curr_reading_date: Date;
  prev_reading: number;
  prev_reading_date: Date;
  measured_qty_cms: number;
  gcv: number;
  mmbtu: number;
  gas_charges: number;
  meter_rent: number;
  fixed_charges: number;
  gst_standard: number;
  gst_further: number;
  withholding_tax: number;
  adjustments_debit: number;
  adjustments_credit: number;
  total_current_charges: number;
  previous_balance: number;
  payable_within_due_date: number;
  late_payment_surcharge: number;
  payment_after_due_date: number;
  gas_supply_deposit: number;
  cnic_registered: boolean;
  monthly_history: {
    month: string;
    cms: number;
    amount: number;
  }[];
  bill_image_url?: string;
  created_at: Date;
}

const ssgcBillSchema = new Schema<ISSGCBill>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bill_type: { type: String, default: 'SSGC' },
  customer_no: String,
  bill_ref_id: String,
  billing_month: String,
  issue_date: Date,
  due_date: Date,
  tariff_class: String,
  meter_no: String,
  curr_reading: Number,
  curr_reading_date: Date,
  prev_reading: Number,
  prev_reading_date: Date,
  measured_qty_cms: Number,
  gcv: Number,
  mmbtu: Number,
  gas_charges: Number,
  meter_rent: Number,
  fixed_charges: Number,
  gst_standard: Number,
  gst_further: Number,
  withholding_tax: Number,
  adjustments_debit: Number,
  adjustments_credit: Number,
  total_current_charges: Number,
  previous_balance: Number,
  payable_within_due_date: Number,
  late_payment_surcharge: Number,
  payment_after_due_date: Number,
  gas_supply_deposit: Number,
  cnic_registered: Boolean,
  monthly_history: [{
    month: String,
    cms: Number,
    amount: Number
  }],
  bill_image_url: String,
  created_at: { type: Date, default: Date.now }
});

export const SSGCBill = mongoose.models.SSGCBill || mongoose.model<ISSGCBill>('SSGCBill', ssgcBillSchema);
