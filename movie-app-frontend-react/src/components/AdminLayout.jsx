import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/movies', label: 'Manage Movies' },
    { path: '/admin/genres', label: 'Manage Genres' },
    { path: '/admin/schedules', label: 'Manage Schedules' },
    { path: '/admin/promos', label: 'Manage Promos' },
  ];

  return (
    <div className="min-h-screen bg-brand-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-800 border-r border-brand-700/50 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-white tracking-widest uppercase">
            Admin<span className="text-brand-primary">Panel</span>
          </Link>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-400 hover:bg-brand-700 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-700/50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-brand-700/50 bg-brand-900/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-white capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
