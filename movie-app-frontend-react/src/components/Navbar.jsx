import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, User, LogOut, LayoutDashboard, Ticket, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/auth';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  const navLinkClass = 'text-gray-300 hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium';
  const mobileLinkClass = 'block px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-brand-800 font-medium transition-colors';

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none from-brand-900 to-transparent bg-gradient-to-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-2 min-w-0">
            <Film className="h-7 w-7 sm:h-8 sm:w-8 text-brand-primary shrink-0" />
            <Link to="/" onClick={closeMenu} className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate">
              Movie-App
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-white hover:text-brand-primary transition-colors px-3 py-2 rounded-md font-medium">Home</Link>
              <Link to="/movies" className={navLinkClass}>Movies</Link>
              <Link to="/schedules" className={navLinkClass}>Schedule</Link>
              <Link to="/promos" className={navLinkClass}>Promos</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button disabled className="text-gray-500 p-2 cursor-not-allowed" title="Search coming soon">
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden md:flex items-center gap-4">
              {token ? (
                <div className="flex items-center gap-4">
                  <Link to="/my-tickets" className="text-gray-300 hover:text-brand-primary flex items-center gap-2 text-sm font-medium transition-colors">
                    <Ticket className="h-4 w-4" />
                    My Tickets
                  </Link>
                  {isAdmin(user) && (
                    <Link to="/admin" className="text-gray-300 hover:text-brand-primary flex items-center gap-2 text-sm font-medium transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 btn-secondary bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-transparent text-white border border-brand-700/50 hover:bg-white/10 rounded-lg transition-colors">
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-900 font-medium hover:bg-brand-primary/90 rounded-lg transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-brand-700/50 bg-brand-900/95 backdrop-blur-md px-4 py-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <Link to="/" onClick={closeMenu} className="block px-3 py-3 rounded-lg text-white hover:bg-brand-800 font-medium transition-colors">Home</Link>
          <Link to="/movies" onClick={closeMenu} className={mobileLinkClass}>Movies</Link>
          <Link to="/schedules" onClick={closeMenu} className={mobileLinkClass}>Schedule</Link>
          <Link to="/promos" onClick={closeMenu} className={mobileLinkClass}>Promos</Link>

          <div className="pt-3 mt-2 border-t border-brand-700/50 space-y-2">
            {token ? (
              <>
                <Link to="/my-tickets" onClick={closeMenu} className={`${mobileLinkClass} flex items-center gap-2`}>
                  <Ticket className="h-4 w-4" />
                  My Tickets
                </Link>
                {isAdmin(user) && (
                  <Link to="/admin" onClick={closeMenu} className={`${mobileLinkClass} flex items-center gap-2`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="w-full flex items-center justify-center gap-2 border border-brand-700/50 text-white hover:bg-white/10 px-4 py-3 rounded-lg font-medium transition-colors">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full flex items-center justify-center bg-brand-primary text-brand-900 hover:bg-brand-primary/90 px-4 py-3 rounded-lg font-bold transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
