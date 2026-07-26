import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setError('');
        const response = await api.get('/schedules/grouped?per_page=10');
        setSchedules(response.data?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
        setError(error.response?.data?.message || 'Failed to fetch schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  if (loading) return <div className="text-center py-10 text-brand-primary animate-pulse">Loading Schedules...</div>;
  if (error) return <div className="text-center py-10 text-red-400">{error}</div>;
  if (schedules.length === 0) return <div className="text-center py-10 text-gray-500">No schedules available.</div>;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-8 w-8 text-brand-primary" />
        <h2 className="text-3xl font-bold text-white">Today's Schedule</h2>
      </div>

      <div className="space-y-6">
        {schedules.map((movieGroup, idx) => {
          const studioMap = movieGroup.schedules?.reduce((acc, sched) => {
            const key = sched.studio?.id || sched.studio_id;
            if (!acc[key]) {
              acc[key] = {
                id: sched.studio?.id || sched.studio_id,
                name: sched.studio?.name || 'Studio',
                schedules: [],
              };
            }
            acc[key].schedules.push(sched);
            return acc;
          }, {});
          const studioList = studioMap ? Object.values(studioMap) : [];

          return (
          <div key={idx} className="glass-panel p-6 border-l-4 border-l-brand-primary">
            <h3 className="text-2xl font-bold text-white mb-4">{movieGroup.movie?.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studioList.map((studio, sIdx) => (
                <div key={sIdx} className="bg-brand-900/50 rounded-xl p-4 border border-brand-700">
                  <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-brand-accent" />
                    {studio.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studio.schedules?.map((sched) => (
                      <button 
                        key={sched.id} 
                        onClick={() => navigate(`/booking/${sched.id}`)}
                        className="flex items-center gap-1 bg-brand-800 hover:bg-brand-primary hover:text-white text-brand-secondary border border-brand-700 hover:border-brand-primary px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
                      >
                        <Clock className="h-3 w-3" />
                        {new Date(sched.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
