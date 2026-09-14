import { Play, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ movie }) {
  const navigate = useNavigate();
  const title = movie?.title || 'Interstellar Odyssey';
  const genreLabel = movie?.genres?.map((g) => g.name).join(', ') || 'Action, Sci-Fi';
  const poster =
    movie?.poster_url ||
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop';
  return (
    <div className="relative h-[70vh] min-h-[520px] sm:h-[80vh] sm:min-h-[600px] w-full mt-0">
      {/* Background Image & Gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={poster}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-2xl mt-16 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold bg-brand-primary/20 text-brand-primary rounded-full border border-brand-primary/30">
              NOW SHOWING
            </span>
            <span className="text-sm text-gray-400">{genreLabel}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-5 sm:mb-6 leading-tight drop-shadow-lg">
            {title}
          </h1>
          
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-xl leading-relaxed line-clamp-4 sm:line-clamp-none">
            {movie?.overview || 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. Experience the ultimate journey in IMAX.'}
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <button 
              onClick={() => (movie?.id ? navigate(`/movies/${movie.id}`) : navigate('/'))}
              className="btn-primary flex items-center justify-center gap-2 text-base sm:text-lg w-full sm:w-auto"
            >
              <CalendarDays className="h-5 w-5" />
              Book Tickets
            </button>
            <button disabled className="glass-panel border-none bg-white/10 text-white/50 px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg cursor-not-allowed w-full sm:w-auto">
              <Play className="h-5 w-5" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
