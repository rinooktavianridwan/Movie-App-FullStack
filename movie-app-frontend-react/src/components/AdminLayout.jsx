import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const headerTitle = navItems.find(item =>
    item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path)
  )?.label || 'Dashboard';

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A';

  const sidebarContent = (
    <>
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
            onClick={() => setSidebarOpen(false)}
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
    </>
  );

  return (
    <div className="min-h-screen bg-brand-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-800 border-r border-brand-700/50 flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-brand-800 border-r border-brand-700/50 hidden md:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-brand-700/50 bg-brand-900/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-300 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {headerTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
              {userInitial}
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
