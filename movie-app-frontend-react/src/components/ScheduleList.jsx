import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Mocking structure based on the restructured Go backend API design
        // that groups showtimes by movie.
        const response = await api.get('/schedules/grouped');
        if (response.data?.data) {
          setSchedules(response.data.data);
        } else {
            // Placeholder data if backend is not running
            setSchedules([
                {
                    movie_id: 1,
                    movie_title: 'Interstellar Odyssey',
                    studios: [
                        { name: 'IMAX Studio 1', showtimes: ['10:00', '13:30', '18:00', '21:00'] },
                        { name: 'Regular Studio 2', showtimes: ['11:00', '15:00', '20:00'] }
                    ]
                },
                {
                    movie_id: 2,
                    movie_title: 'Dune: Part Two',
                    studios: [
                        { name: 'Dolby Cinema', showtimes: ['12:00', '16:30', '21:45'] }
                    ]
                }
            ]);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  if (loading) return <div className="text-center py-10 text-brand-primary animate-pulse">Loading Schedules...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-8 w-8 text-brand-primary" />
        <h2 className="text-3xl font-bold text-white">Today's Schedule</h2>
      </div>

      <div className="space-y-6">
        {schedules.map((movie, idx) => (
          <div key={idx} className="glass-panel p-6 border-l-4 border-l-brand-primary">
            <h3 className="text-2xl font-bold text-white mb-4">{movie.movie_title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movie.studios?.map((studio, sIdx) => (
                <div key={sIdx} className="bg-brand-900/50 rounded-xl p-4 border border-brand-700">
                  <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-brand-accent" />
                    {studio.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studio.showtimes?.map((time, tIdx) => (
                      <button 
                        key={tIdx} 
                        disabled
                        className="flex items-center gap-1 bg-brand-800 text-brand-secondary border border-brand-700 px-3 py-1.5 rounded-lg text-sm cursor-not-allowed opacity-60"
                      >
                        <Clock className="h-3 w-3" />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
