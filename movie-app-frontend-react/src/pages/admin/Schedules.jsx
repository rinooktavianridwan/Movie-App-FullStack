import { useState, useEffect } from 'react';
import api, { generateSchedules } from '../../services/api';
import Pagination from '../../components/Pagination';
import { Pencil, Trash2, Plus, X, Clock, Zap, Loader2 } from 'lucide-react';

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [movies, setMovies] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    movie_id: '',
    studio_id: '',
    start_time: '',
    date: '',
    price: ''
  });
  const [apiError, setApiError] = useState('');

  // Generate Schedules Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [generateForm, setGenerateForm] = useState({
    days_ahead: 2,
    max_movies: 20,
    open_hour: 10,
    close_hour: 23,
    buffer_mins: 30,
    min_price: 25000,
    max_price: 100000,
  });

  const fetchDependencies = async () => {
    try {
      const [movRes, stuRes] = await Promise.all([
        api.get('/movies?per_page=999'),
        api.get('/studios?per_page=999')
      ]);
      setMovies(movRes.data?.data?.data || []);
      setStudios(stuRes.data?.data?.data || []);
    } catch (err) {
      console.error('Failed to load movies/studios dependencies', err);
    }
  };

  const fetchSchedules = async (p = page) => {
    setLoading(true);
    try {
      const response = await api.get(`/schedules?page=${p}&per_page=10`);
      const d = response.data?.data;
      setSchedules(d?.data || []);
      setPage(d?.page || 1);
      setTotalPages(d?.total_page || 1);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchSchedules(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormData({
      movie_id: movies.length > 0 ? movies[0].id : '',
      studio_id: studios.length > 0 ? studios[0].id : '',
      start_time: '',
      date: '',
      price: ''
    });
    setApiError('');
    setShowModal(true);
  };

  const formatLocalToTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch { return ''; }
  };

  const formatLocalToDate = (isoString) => {
    if (!isoString) return '';
    try {
      return isoString.split('T')[0];
    } catch { return ''; }
  };

  const openEditModal = (sched) => {
    setModalMode('edit');
    setSelectedId(sched.id);
    setFormData({
      movie_id: sched.movie_id,
      studio_id: sched.studio_id,
      start_time: formatLocalToTime(sched.start_time),
      date: formatLocalToDate(sched.date),
      price: sched.price
    });
    setApiError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setApiError('');
    try {
      const dateStr = formData.date;
      const timeStr = formData.start_time;
      const payload = {
        movie_id: parseInt(formData.movie_id),
        studio_id: parseInt(formData.studio_id),
        start_time: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
        date: new Date(`${dateStr}T12:00:00`).toISOString(),
        price: parseFloat(formData.price)
      };

      if (modalMode === 'add') {
        await api.post('/schedules', payload);
      } else {
        await api.put(`/schedules/${selectedId}`, payload);
      }
      setShowModal(false);
      fetchSchedules(1);
    } catch (err) {
      setApiError(err.response?.data?.message || `Failed to ${modalMode} schedule`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  const openGenerateModal = () => {
    setGenerateForm({
      days_ahead: 2,
      max_movies: 20,
      open_hour: 10,
      close_hour: 23,
      buffer_mins: 30,
      min_price: 25000,
      max_price: 100000,
    });
    setGenerateResult(null);
    setGenerateError('');
    setShowGenerateModal(true);
  };

  const handleGenerateSchedules = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenerateError('');
    try {
      const res = await generateSchedules(generateForm);
      setGenerateResult(res.data?.data);
      await fetchSchedules(1);
    } catch (err) {
      setGenerateError(err.response?.data?.message || 'Failed to generate schedules');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-2xl p-6 bg-brand-900 border-brand-primary/30 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-brand-700/50 pb-4">
              {modalMode === 'add' ? <Plus className="h-5 w-5 text-brand-primary" /> : <Pencil className="h-5 w-5 text-brand-primary" />}
              {modalMode === 'add' ? 'Add New Schedule' : 'Edit Schedule'}
            </h3>
            {apiError && (
              <div className="mb-4 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Movie</label>
                  <select 
                    value={formData.movie_id}
                    onChange={(e) => setFormData({...formData, movie_id: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    required
                  >
                    <option value="" disabled>Select Movie</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Studio</label>
                  <select 
                    value={formData.studio_id}
                    onChange={(e) => setFormData({...formData, studio_id: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    required
                  >
                    <option value="" disabled>Select Studio</option>
                    {studios.map(s => <option key={s.id} value={s.id}>{s.name} ({s.seat_capacity} seats)</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Show Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Ticket Price (Rp)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. 50000"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-lg">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Schedules Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-lg p-6 bg-brand-900 border-brand-primary/30 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowGenerateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-brand-700/50 pb-4">
              <Zap className="h-5 w-5 text-brand-primary" />
              Generate Schedules
            </h3>
            {generateError && (
              <div className="mb-4 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                {generateError}
              </div>
            )}
            {generateResult && !generating && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm space-y-1">
                <div className="font-semibold">Generation Complete!</div>
                <div>Created: {generateResult.created} schedules</div>
                <div>Skipped: {generateResult.skipped} (already exist)</div>
                <div>Movies processed: {generateResult.movies_processed}</div>
                <div>Days covered: {generateResult.days_covered}</div>
                <div>Studios used: {generateResult.studios_used}</div>
              </div>
            )}
            <form onSubmit={handleGenerateSchedules} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Days Ahead</label>
                  <input
                    type="number"
                    value={generateForm.days_ahead}
                    onChange={(e) => setGenerateForm({...generateForm, days_ahead: parseInt(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="1"
                    max="30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Max Movies</label>
                  <input
                    type="number"
                    value={generateForm.max_movies}
                    onChange={(e) => setGenerateForm({...generateForm, max_movies: parseInt(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Open Hour</label>
                  <input
                    type="number"
                    value={generateForm.open_hour}
                    onChange={(e) => setGenerateForm({...generateForm, open_hour: parseInt(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="0"
                    max="23"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Close Hour</label>
                  <input
                    type="number"
                    value={generateForm.close_hour}
                    onChange={(e) => setGenerateForm({...generateForm, close_hour: parseInt(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="1"
                    max="24"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Buffer (minutes)</label>
                  <input
                    type="number"
                    value={generateForm.buffer_mins}
                    onChange={(e) => setGenerateForm({...generateForm, buffer_mins: parseInt(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="0"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={generateForm.min_price}
                    onChange={(e) => setGenerateForm({...generateForm, min_price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Max Price</label>
                <input
                  type="number"
                  value={generateForm.max_price}
                  onChange={(e) => setGenerateForm({...generateForm, max_price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-700/50">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-6 py-2 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-lg disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Schedules'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-800 p-6 rounded-xl border border-brand-700/50 shadow-lg">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1"><Clock className="inline-block h-6 w-6 mr-2 mb-1" />Showtimes Management</h2>
            <p className="text-gray-400 text-sm">Schedule movies into studio theater timeslots.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={openGenerateModal} disabled={generating} className="bg-brand-900 text-white border border-brand-700 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            <Zap className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            Generate Schedules
          </button>
          <button onClick={openAddModal} className="bg-brand-primary text-brand-900 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Schedule
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel border-brand-700/30 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto bg-brand-900/40 w-full min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="sticky top-0 bg-brand-800 z-10 shadow-md">
                <tr>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider w-16">ID</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Movie</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Studio</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-700/30">
                {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading schedules...</td></tr>
                ) : schedules.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No schedules configured.</td></tr>
                ) : (
                schedules.map((sched) => (
                    <tr key={sched.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 text-gray-400 group-hover:text-white transition-colors">#{sched.id}</td>
                        <td className="p-5 text-brand-primary font-medium">{sched.movie?.title || `(ID:${sched.movie_id})`}</td>
                        <td className="p-5 text-white">{sched.studio?.name || `(ID:${sched.studio_id})`}</td>
                        <td className="p-5 text-gray-400">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-300">{new Date(sched.date).toLocaleDateString()}</span>
                            <span className="text-xs text-brand-primary">{new Date(sched.start_time).toLocaleTimeString()} - {new Date(sched.end_time).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="p-5 text-green-400">Rp {Number(sched.price).toLocaleString()}</td>
                        <td className="p-5 text-right flex justify-end gap-3 items-center mt-2">
                            <button onClick={() => openEditModal(sched)} className="text-brand-primary hover:text-white transition-colors p-2 rounded hover:bg-brand-primary/20" title="Edit">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(sched.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-400/20" title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={fetchSchedules} />
      </div>
    </div>
  );
}
