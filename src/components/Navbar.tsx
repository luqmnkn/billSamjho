import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Zap, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
          <Zap className="text-white fill-currentColor w-5 h-5" />
        </div>
        <span className="text-slate-900 text-2xl font-black tracking-tighter">Bill Samjho <span className="text-blue-600 font-normal text-lg ml-1">بل سمجھو</span></span>
      </Link>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-4 md:gap-6">
            <Link 
              to="/dashboard" 
              className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-slate-900 text-xs font-bold">{user?.name}</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Karachi, PK</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 md:gap-6">
            <Link 
              to="/login" 
              className="text-slate-900 hover:text-blue-600 transition-colors text-sm font-semibold border border-slate-200 px-5 py-2 rounded-full hover:bg-slate-50"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
