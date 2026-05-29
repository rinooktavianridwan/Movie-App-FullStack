import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setError('');
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data?.data || null);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError(err.response?.data?.message || 'Failed to fetch movie details.');
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setScheduleLoading(true);
        setScheduleError('');
        const res = await api.get(`/schedules?movie_id=${id}&per_page=100`);
        setSchedules(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setScheduleError(err.response?.data?.message || 'Failed to fetch schedules.');
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchSchedules();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading film details...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-white">Movie not found.</div>;
  }

  const genreLabel = movie.genres?.map((g) => g.name).join(', ') || 'General';
  const poster =
    movie.poster_url ||
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop';
  const ratingValue = movie.rating || movie.vote_average;
  const firstSchedule = schedules[0];

  return (
    <div className="relative min-h-screen pt-20 pb-24">
      {/* Background Poster Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-3xl"
        style={{ backgroundImage: `url(${poster})` }}
      ></div>
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Poster Image */}
        <div className="lg:col-span-1">
           <div className="rounded-2xl overflow-hidden shadow-2xl border border-brand-700/50 aspect-[2/3] sticky top-32">
              <img 
                src={poster}
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
           </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-2 space-y-8">
           <div>
               <div className="flex items-center gap-3 text-brand-primary font-medium text-sm mb-4 tracking-wider uppercase">
                   <span>{genreLabel}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                   <span>{movie.duration} Minutes</span>
               </div>
               <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                   {movie.title}
               </h1>
               {ratingValue && (
                 <div className="flex items-center gap-2 mb-8 glass-panel inline-flex px-4 py-2 rounded-full border-brand-primary/20">
                     <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                     </svg>
                     <span className="text-white font-bold">{ratingValue}</span>
                     <span className="text-gray-400 text-sm">/ 5.0</span>
                 </div>
               )}
           </div>

           <div>
              <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-10">
                 {movie.overview || 'No synopsis available yet.'}
              </p>
            </div>

            <div className="pt-8 border-t border-brand-700/50 flex flex-col sm:flex-row gap-4">
                <button 
                   onClick={() => firstSchedule && navigate(`/booking/${firstSchedule.id}`)}
                   disabled={!firstSchedule}
                   className={`px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-brand-primary/25 flex items-center gap-3 justify-center ${
                     firstSchedule
                       ? 'bg-brand-primary text-brand-900 hover:bg-brand-primary/90 hover:-translate-y-1'
                       : 'bg-brand-800 text-gray-500 cursor-not-allowed'
                   }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    {firstSchedule ? 'Book Tickets Now' : 'No Showtimes Available'}
                </button>
                <button className="px-8 py-4 glass-panel text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-colors flex items-center gap-3 justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Watch Trailer
                </button>
            </div>

            <div id="movie-schedules" className="pt-10 border-t border-brand-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Available Showtimes</h3>
              {scheduleLoading ? (
                <div className="text-gray-400">Loading schedules...</div>
              ) : scheduleError ? (
                <div className="text-red-400">{scheduleError}</div>
              ) : schedules.length === 0 ? (
                <div className="text-gray-500">No schedules found for this movie.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((sched) => (
                    <button
                      key={sched.id}
                      onClick={() => navigate(`/booking/${sched.id}`)}
                      className="glass-panel p-4 border border-brand-700/50 hover:border-brand-primary/60 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{sched.studio?.name || 'Studio'}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(sched.date).toLocaleDateString('id-ID')} •{' '}
                            {new Date(sched.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-brand-primary font-bold">
                          Rp {Number(sched.price || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
