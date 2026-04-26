import mongoose from 'mongoose';
const { Schema } = mongoose;
import type { Document } from 'mongoose';

export interface IBill extends Document {
  user: mongoose.Types.ObjectId;
  consumer_no: string;
  billing_month: string;
  due_date: Date;
  units_consumed: number;
  total_amount: number;
  extracted_data: {
    charges: {
      name: string;
      amount: number;
      explanation_en: string;
      explanation_ur: string;
    }[];
    tax_slab_info: string;
    is_slab_trap: boolean;
    peak_units?: number;
    off_peak_units?: number;
    meter_reading_date?: Date;
  };
  bill_image_url?: string;
  bill_type: 'KE' | 'SSGC';
  created_at: Date;
}

const billSchema = new Schema<IBill>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bill_type: { type: String, enum: ['KE', 'SSGC'], default: 'KE' },
  consumer_no: { type: String, required: true },
  billing_month: { type: String, required: true },
  due_date: { type: Date, required: true },
  units_consumed: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  extracted_data: {
    charges: [{
      name: String,
      amount: Number,
      explanation_en: String,
      explanation_ur: String
    }],
    tax_slab_info: String,
    is_slab_trap: Boolean,
    peak_units: Number,
    off_peak_units: Number,
    meter_reading_date: Date
  },
  bill_image_url: { type: String },
  created_at: { type: Date, default: Date.now },
});

export const Bill = mongoose.models.Bill || mongoose.model<IBill>('Bill', billSchema);
