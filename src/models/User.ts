import mongoose from 'mongoose';
const { Schema } = mongoose;
import type { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  consumer_no_ke?: string;
  consumer_no_ssgc?: string;
  appliances?: {
    refrigerator: boolean;
    fans: number;
    ac: number;
    washing_machine: boolean;
    iron: boolean;
    microwave: boolean;
  };
  created_at: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  consumer_no_ke: { type: String },
  consumer_no_ssgc: { type: String },
  appliances: {
    refrigerator: { type: Boolean, default: false },
    fans: { type: Number, default: 0 },
    ac: { type: Number, default: 0 },
    washing_machine: { type: Boolean, default: false },
    iron: { type: Boolean, default: false },
    microwave: { type: Boolean, default: false },
  },
  created_at: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
