import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupSchedulesByDateAndStudio, getDateDisplayInfo } from '../utils/scheduleGrouping';

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
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setError(err.response?.data?.message || 'Failed to fetch schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  if (loading) return <div className="text-center py-10 text-brand-primary animate-pulse">Loading Schedules...</div>;
  if (error) return <div className="text-center py-10 text-red-400">{error}</div>;
  if (schedules.length === 0) return <div className="text-center py-10 text-gray-500">No schedules available.</div>;

  const visibleSchedules = schedules.slice(0, 3);
  const hasMoreSchedules = schedules.length > 3;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-brand-primary" />
          <h2 className="text-3xl font-bold text-white">Today's Schedule</h2>
        </div>
        {hasMoreSchedules && (
          <button
            type="button"
            onClick={() => navigate('/schedules')}
            className="text-brand-primary hover:text-white transition-colors text-sm font-medium"
          >
            View All →
          </button>
        )}
      </div>

      <div className="space-y-6">
        {visibleSchedules.map((movieGroup, idx) => {
          const dateGroups = groupSchedulesByDateAndStudio(movieGroup.schedules);
          if (dateGroups.length === 0) return null;

          return (
            <div key={movieGroup.movie?.id || idx} className="glass-panel p-6 border-l-4 border-l-brand-primary">
              <h3 className="text-2xl font-bold text-white mb-4">{movieGroup.movie?.title}</h3>

              <div className="space-y-4">
                {dateGroups.map((dateGroup) => {
                  const { label, tag } = getDateDisplayInfo(dateGroup.date);

                  return (
                    <div
                      key={dateGroup.key}
                      className="rounded-xl border border-brand-700/60 bg-brand-900/30 overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 bg-brand-800/60 border-b border-brand-700/60">
                        <Calendar className="h-4 w-4 text-brand-accent" />
                        <span className="text-sm font-semibold text-white">{label}</span>
                        {tag && (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-brand-900 bg-brand-primary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        )}
                      </div>

                      <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dateGroup.studios.map((studio) => (
                          <div key={studio.id} className="bg-brand-900/50 rounded-xl p-4 border border-brand-700">
                            <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium">
                              <MapPin className="h-4 w-4 text-brand-accent" />
                              {studio.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {studio.schedules.map((sched) => (
                                <button
                                  key={sched.id}
                                  type="button"
                                  onClick={() => navigate(`/booking/${sched.id}`)}
                                  className="flex items-center gap-1 bg-brand-800 hover:bg-brand-primary hover:text-white text-brand-secondary border border-brand-700 hover:border-brand-primary px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
                                >
                                  <Clock className="h-3 w-3" />
                                  {new Date(sched.start_time).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
