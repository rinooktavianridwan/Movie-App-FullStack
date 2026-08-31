import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Search, Star } from 'lucide-react';
import api from '../services/api';

const PAGE_SIZE = 8;

export default function MoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/genres?per_page=100');
        setGenres(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: String(page),
          per_page: String(PAGE_SIZE),
        });

        if (search.trim()) {
          params.set('search', search.trim());
        }

        if (selectedGenre) {
          params.set('genre_id', selectedGenre);
        }

        const res = await api.get(`/movies?${params.toString()}`);
        const payload = res.data?.data || {};
        setMovies(payload.data || []);
        setTotalPages(payload.total_page || 1);
      } catch (err) {
        console.error('Failed to fetch movies list:', err);
        setError(err.response?.data?.message || 'Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, search, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Film className="h-9 w-9 text-brand-primary" />
            <h1 className="text-4xl font-bold text-white">All Movies</h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movie title"
                className="w-full bg-brand-800/80 border border-brand-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-brand-800/80 border border-brand-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-primary animate-pulse">Loading movies...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No movies available.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {movies.map((movie) => {
                const poster =
                  movie.poster_url ||
                  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop';
                const genres = movie.genres?.map((g) => g.name).join(', ') || 'General';

                return (
                  <div
                    key={movie.id}
                    className="group glass-panel overflow-hidden border border-brand-700/50 rounded-2xl hover:border-brand-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
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

                    <div className="p-3 sm:p-5 flex flex-col flex-1">
                      <div>
                        <h2 className="text-sm sm:text-xl font-bold text-white leading-snug line-clamp-2">{movie.title}</h2>
                      </div>

                      <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-300">
                        <span className="bg-brand-800/80 rounded-full px-2 py-1">{genres}</span>
                        {movie.duration && <span className="bg-brand-800/80 rounded-full px-2 py-1">{movie.duration} min</span>}
                      </div>

                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 line-clamp-2 sm:line-clamp-4">
                        {movie.overview || 'No synopsis available yet.'}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/movies/${movie.id}`);
                        }}
                        className="mt-auto w-full btn-primary text-center text-xs sm:text-sm"
                      >
                        Read Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-brand-700 bg-brand-900 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-300">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-brand-700 bg-brand-900 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
