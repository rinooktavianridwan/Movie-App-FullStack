import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isAdmin } from './utils/auth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MoviesPage from './pages/MoviesPage';
import SchedulesPage from './pages/SchedulesPage';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import Booking from './pages/Booking';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMovies from './pages/admin/Movies';
import AdminGenres from './pages/admin/Genres';
import AdminSchedules from './pages/admin/Schedules';
import AdminPromos from './pages/admin/Promos';
import AdminStudios from './pages/admin/Studios';

// Custom Private Route implementation
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route implementation
const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin(user)) return <Navigate to="/" replace />;
  return children;
};

// Layout for the public site
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/movies" element={<PublicLayout><MoviesPage /></PublicLayout>} />
          <Route path="/schedules" element={<PublicLayout><SchedulesPage /></PublicLayout>} />
          <Route path="/movies/:id" element={<PublicLayout><MovieDetails /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Public Routes (User Booking) */}
          <Route path="/booking/:id" element={
            <ProtectedRoute>
                <PublicLayout><Booking /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="studios" element={<AdminStudios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
