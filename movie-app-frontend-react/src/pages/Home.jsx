import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import ScheduleList from '../components/ScheduleList';
import PromoValidator from '../components/PromoValidator';
import api from '../services/api';

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        setFeaturedMovies(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        // Fallback for demonstration since backend might not be seeded or matching url yet
        setFeaturedMovies([
          { id: 1, title: "Interstellar Odyssey", genre: "Action, Sci-Fi", rating: "4.9", duration: "2h 45m", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop" },
          { id: 2, title: "Dune: Part Two", genre: "Sci-Fi, Adventure", rating: "4.8", duration: "2h 46m", image: "https://images.unsplash.com/photo-1618477388954-7f15bce3240b?q=80&w=600&auto=format&fit=crop" },
          { id: 3, title: "Neon City", genre: "Cyberpunk, Thriller", rating: "4.5", duration: "1h 58m", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop" },
          { id: 4, title: "The Last Dawn", genre: "Drama, Survival", rating: "4.7", duration: "2h 12m", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20">
      <HeroSection />
      
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
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredMovies.map((movie) => (
                  <MovieCard key={movie.id} {...movie} />
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
