import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import ScheduleList from '../components/ScheduleList';
import PromoValidator from '../components/PromoValidator';
import api from '../services/api';

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <button className="text-brand-primary hover:text-white transition-colors text-sm font-medium">
              View All
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading movies...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-12">{error}</div>
          ) : featuredMovies.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No movies available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  genre={movie.genres?.map((g) => g.name).join(', ') || 'General'}
                  duration={movie.duration ? `${movie.duration} min` : undefined}
                  image={movie.poster_url}
                />
              ))}
            </div>
          )}
        </section>

        {/* Schedule & Promo Section */}
        <section id="schedule" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ScheduleList />
          </div>
          
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-brand-700/50 pt-12 lg:pt-0 lg:pl-12 flex flex-col justify-start">
            <div id="promo" className="sticky top-28">
              <h2 className="text-2xl font-bold text-white mb-6">Have a Promo?</h2>
              <PromoValidator />
              
              <div className="mt-8 glass-panel p-6 bg-brand-primary/5 border-brand-primary/20">
                <h4 className="text-brand-primary font-semibold mb-2">Member Benefits</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">✓ Earn points on every booking</li>
                  <li className="flex items-center gap-2">✓ Exclusive access to premieres</li>
                  <li className="flex items-center gap-2">✓ Birthday special discounts</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
