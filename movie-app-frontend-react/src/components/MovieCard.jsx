import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MovieCard({ id, title, genre, rating, image, duration }) {
  const navigate = useNavigate();
  const showRating = rating !== undefined && rating !== null && rating !== '';

  return (
    <div 
      onClick={() => navigate(`/movies/${id}`)}
      className="group relative glass-panel overflow-hidden border border-brand-700/40 hover:border-brand-primary/50 transition-all duration-500 rounded-2xl cursor-pointer"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={image || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop"} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{title}</h3>
          {showRating && (
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md text-sm text-brand-highlight">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-semibold">{rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          <div className="flex flex-col">
            <span className="text-sm text-brand-primary font-medium">{genre || 'General'}</span>
            {duration && <span className="text-xs text-gray-400">{duration}</span>}
          </div>
          <button className="bg-brand-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-violet-500 hover:shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all">
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
