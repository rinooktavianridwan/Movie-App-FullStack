import { Play, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="relative h-[80vh] min-h-[600px] w-full mt-0">
      {/* Background Image & Gradient overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-2xl mt-16 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold bg-brand-primary/20 text-brand-primary rounded-full border border-brand-primary/30">
              NOW SHOWING
            </span>
            <span className="text-sm text-gray-400">Action, Sci-Fi</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Interstellar <br/> Odyssey
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
            A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Experience the ultimate journey in IMAX.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => navigate('/movies/1')}
              className="btn-primary flex items-center gap-2 text-lg"
            >
              <CalendarDays className="h-5 w-5" />
              Book Tickets
            </button>
            <button disabled className="glass-panel border-none bg-white/10 text-white/50 px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-lg cursor-not-allowed">
              <Play className="h-5 w-5" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
