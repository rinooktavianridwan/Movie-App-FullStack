import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import ScheduleList from '../components/ScheduleList';
import PromoValidator from '../components/PromoValidator';
import api from '../services/api';

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies?per_page=12');
        setFeaturedMovies(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError(err.response?.data?.message || 'Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const visibleMovies = featuredMovies.slice(0, window.innerWidth < 768 ? 6 : 4);

  return (
    <div className="flex flex-col gap-20 pb-20">
      <HeroSection movie={featuredMovies[0]} />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col gap-24">
        
        {/* Now Playing Section */}
        <section id="movies">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-primary rounded-full"></span>
              Now Playing
            </h2>
            {featuredMovies.length > (window.innerWidth < 768 ? 6 : 4) && (
              <button
                type="button"
                onClick={() => navigate('/movies')}
                className="text-brand-primary hover:text-white transition-colors text-sm font-medium"
              >
                View All →
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading movies...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-12">{error}</div>
          ) : featuredMovies.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No movies available.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  genre={movie.genres?.map((g) => g.name).join(', ') || 'General'}
                  rating={movie.rating}
                  duration={movie.duration ? `${movie.duration} min` : undefined}
                  image={movie.poster_url}
                />
              ))}
            </div>
          )}
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ScheduleList />
          </div>
          
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-brand-700/50 pt-12 lg:pt-0 lg:pl-12 flex flex-col justify-start">
            <div className="sticky top-28">
              <h2 className="text-2xl font-bold text-white mb-6">Have a Promo?</h2>
              <PromoValidator />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
