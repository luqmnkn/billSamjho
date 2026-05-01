import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Zap, Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    consumer_no_ke: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/signup', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard.tsx');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="text-blue-500 fill-blue-500 w-8 h-8" />
            <span className="text-white text-3xl font-black tracking-tight italic">Bill Samjho</span>
          </Link>
          <h1 className="text-2xl font-black text-white italic tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-2 font-medium">Start understanding your bills today</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center gap-2 mb-6 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">KE Consumer No (Optional)</label>
                <div className="group relative">
                  <Info size={14} className="text-slate-500 cursor-help transition-colors hover:text-blue-500" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none font-medium">
                    Found on the top right of your KE bill. Usually 12-14 digits.
                  </div>
                </div>
              </div>
              <input 
                type="text" 
                name="consumer_no_ke"
                value={formData.consumer_no_ke}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium font-mono text-sm"
                placeholder="LA123456789"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Free Account"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">
              Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline ml-1">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
