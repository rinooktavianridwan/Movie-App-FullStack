import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/auth';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none from-brand-900 to-transparent bg-gradient-to-b">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Film className="h-8 w-8 text-brand-primary" />
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Movie-App
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-white hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium">Home</Link>
              <Link to="/movies" className="text-gray-300 hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium">Movies</Link>
              <Link to="/schedules" className="text-gray-300 hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium">Schedule</Link>
              <Link to="/promos" className="text-gray-300 hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium">Promos</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button disabled className="text-gray-500 p-2 cursor-not-allowed" title="Search coming soon">
              <Search className="h-5 w-5" />
            </button>
            {token ? (
                <div className="flex items-center gap-4">
                  <Link to="/my-tickets" className="text-gray-300 hover:text-brand-primary hidden sm:flex items-center gap-2 text-sm font-medium transition-colors">
                    <Ticket className="h-4 w-4" />
                    My Tickets
                  </Link>
                  {isAdmin(user) && (
                    <Link to="/admin" className="text-gray-300 hover:text-brand-primary hidden sm:flex items-center gap-2 text-sm font-medium transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 btn-secondary bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-transparent text-white border border-brand-700/50 hover:bg-white/10 rounded-lg transition-colors">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:block">Sign In</span>
                  </Link>
                  <Link to="/register" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-900 font-medium hover:bg-brand-primary/90 rounded-lg transition-colors">
                    <span className="hidden sm:block">Sign Up</span>
                  </Link>
                </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
