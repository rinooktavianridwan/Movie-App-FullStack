import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        // Fallback dummy data if backend gives 404
        setMovie({
          id,
          title: "Interstellar Odyssey",
          genre: "Action, Sci-Fi",
          duration: "165",
          overview: "When a wormhole is discovered, explorers and scientists must unite to find a new home for humanity. A visually stunning journey through space and time that challenges the boundaries of human endurance and love.",
          image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
          rating: "4.9"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading film details...</div>;
  }

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-white">Movie not found.</div>;
  }

  return (
    <div className="relative min-h-screen pt-20 pb-24">
      {/* Background Poster Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-3xl"
        style={{ backgroundImage: `url(${movie.image || movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop'})` }}
      ></div>
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Poster Image */}
        <div className="lg:col-span-1">
           <div className="rounded-2xl overflow-hidden shadow-2xl border border-brand-700/50 aspect-[2/3] sticky top-32">
              <img 
                src={movie.image || movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
           </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-2 space-y-8">
           <div>
               <div className="flex items-center gap-3 text-brand-primary font-medium text-sm mb-4 tracking-wider uppercase">
                   <span>{movie.genre || movie.genre_id || 'Sci-Fi'}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                   <span>{movie.duration} Minutes</span>
               </div>
               <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                  {movie.title}
               </h1>
               <div className="flex items-center gap-2 mb-8 glass-panel inline-flex px-4 py-2 rounded-full border-brand-primary/20">
                   <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                   </svg>
                   <span className="text-white font-bold">{movie.rating || '4.9'}</span>
                   <span className="text-gray-400 text-sm">/ 5.0</span>
               </div>
           </div>

           <div>
              <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-10">
                 {movie.overview || "When a wormhole is discovered, explorers and scientists must unite to find a new home for humanity. A visually stunning journey through space and time that challenges the boundaries of human endurance and love."}
              </p>
           </div>

           <div className="pt-8 border-t border-brand-700/50 flex flex-col sm:flex-row gap-4">
               <button 
                  onClick={() => navigate(`/booking/${id}`)}
                  className="px-8 py-4 bg-brand-primary text-brand-900 font-bold rounded-xl text-lg hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/25 hover:-translate-y-1 flex items-center gap-3 justify-center"
               >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                   Book Tickets Now
               </button>
               <button disabled className="px-8 py-4 glass-panel text-white/50 font-bold rounded-xl text-lg cursor-not-allowed flex items-center gap-3 justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Watch Trailer
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}
