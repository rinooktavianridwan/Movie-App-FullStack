import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, Ticket } from 'lucide-react';
import api from '../services/api';

const PAGE_SIZE = 3;

export default function SchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStudio, setSelectedStudio] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const res = await api.get('/studios?per_page=100');
        setStudios(res.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch studios:', err);
      }
    };

    fetchStudios();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setError('');
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(PAGE_SIZE),
        });

        if (search.trim()) {
          params.set('movie_title', search.trim());
        }

        if (selectedDate) {
          params.set('date', selectedDate);
        }

        if (selectedStudio) {
          params.set('studio_id', selectedStudio);
        }

        const response = await api.get(`/schedules/grouped?${params.toString()}`);
        const payload = response.data?.data || {};
        setSchedules(payload.data || []);
        setTotalPages(payload.total_page || 1);
      } catch (err) {
        console.error('Failed to fetch schedule list:', err);
        setError(err.response?.data?.message || 'Failed to fetch schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [page, search, selectedDate, selectedStudio]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-9 w-9 text-brand-primary" />
            <h1 className="text-4xl font-bold text-white">All Schedules</h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl flex flex-col gap-3 sm:flex-row">
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

            <div className="w-full sm:w-52">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-brand-800/80 border border-brand-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="w-full sm:w-52">
              <select
                value={selectedStudio}
                onChange={(e) => {
                  setSelectedStudio(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-brand-800/80 border border-brand-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Studios</option>
                {studios.map((studio) => (
                  <option key={studio.id} value={studio.id}>{studio.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-primary animate-pulse">Loading schedules...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No schedules available.</div>
        ) : (
          <>
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
