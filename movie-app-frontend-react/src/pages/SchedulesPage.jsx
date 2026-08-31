import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import api from '../services/api';

export default function SchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setError('');
        const response = await api.get('/schedules/grouped?per_page=100');
        setSchedules(response.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch schedule list:', err);
        setError(err.response?.data?.message || 'Failed to fetch schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-3">
          <Calendar className="h-9 w-9 text-brand-primary" />
          <h1 className="text-4xl font-bold text-white">All Schedules</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-primary animate-pulse">Loading schedules...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No schedules available.</div>
        ) : (
          <div className="space-y-8">
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
                <div
                  key={movieGroup.movie?.id || idx}
                  className="glass-panel p-6 border-l-4 border-l-brand-primary"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white">{movieGroup.movie?.title}</h2>
                      <p className="mt-2 text-gray-400 max-w-2xl">
                        {movieGroup.movie?.overview || 'No synopsis available yet.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/movies/${movieGroup.movie?.id}`)}
                      className="btn-secondary px-4 py-2 w-fit"
                    >
                      Read Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {studioList.map((studio, studioIdx) => (
                      <div key={studio.id || studioIdx} className="bg-brand-900/50 border border-brand-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium">
                          <MapPin className="h-4 w-4 text-brand-primary" />
                          {studio.name}
                        </div>

                        <div className="space-y-2">
                          {studio.schedules?.map((sched) => (
                            <button
                              key={sched.id}
                              type="button"
                              onClick={() => navigate(`/booking/${sched.id}`)}
                              className="w-full flex items-center justify-between gap-3 bg-brand-800 hover:bg-brand-primary hover:text-white text-brand-secondary border border-brand-700 hover:border-brand-primary rounded-lg px-3 py-2 text-left transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(sched.start_time).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Ticket className="h-3.5 w-3.5" />
                                Rp {Number(sched.price || 0).toLocaleString('id-ID')}
                              </div>
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
        )}
      </div>
    </div>
  );
}
