import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Star } from 'lucide-react';
import api from '../services/api';

export default function MoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setError('');
        const res = await api.get('/movies?per_page=100');
        setMovies(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch movies list:', err);
        setError(err.response?.data?.message || 'Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-3">
          <Film className="h-9 w-9 text-brand-primary" />
          <h1 className="text-4xl font-bold text-white">All Movies</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-primary animate-pulse">Loading movies...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No movies available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie) => {
              const poster =
                movie.poster_url ||
                'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop';
              const genres = movie.genres?.map((g) => g.name).join(', ') || 'General';

              return (
                <div
                  key={movie.id}
                  className="group glass-panel overflow-hidden border border-brand-700/50 rounded-2xl hover:border-brand-primary/50 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/35 to-transparent" />
                    {movie.rating && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full text-sm text-brand-highlight">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{movie.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-xl font-bold text-white leading-snug">{movie.title}</h2>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                      <span className="bg-brand-800/80 rounded-full px-2 py-1">{genres}</span>
                      {movie.duration && <span className="bg-brand-800/80 rounded-full px-2 py-1">{movie.duration} min</span>}
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-4">
                      {movie.overview || 'No synopsis available yet.'}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movies/${movie.id}`);
                      }}
                      className="mt-2 w-full btn-primary text-center"
                    >
                      Read Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
