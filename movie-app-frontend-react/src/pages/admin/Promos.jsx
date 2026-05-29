import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Pencil, Trash2, Plus, X, Tag } from 'lucide-react';

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_tickets: 1,
    max_discount: '',
    usage_limit: '',
    is_active: true,
    valid_from: '',
    valid_until: '',
    movie_ids: []
  });
  const [apiError, setApiError] = useState('');

  const fetchDependencies = async () => {
    try {
      const response = await api.get('/movies?per_page=999');
      setMovies(response.data?.data?.data || []);
    } catch (err) {
      console.error('Failed to load movies dependency', err);
    }
  };

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promos?per_page=100');
      setPromos(response.data?.data?.data || []);
    } catch (err) {
      console.error('Error fetching promos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchPromos();
  }, []);

  const formatLocalToDatetime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0,16);
    } catch(e) { return ''; }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_tickets: 1,
      max_discount: '',
      usage_limit: '',
      is_active: true,
      valid_from: '',
      valid_until: '',
      movie_ids: []
    });
    setApiError('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setSelectedId(p.id);
    setFormData({
      name: p.name,
      code: p.code,
      description: p.description,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      min_tickets: p.min_tickets,
      max_discount: p.max_discount || '',
      usage_limit: p.usage_limit || '',
      is_active: p.is_active,
      valid_from: formatLocalToDatetime(p.valid_from),
      valid_until: formatLocalToDatetime(p.valid_until),
      movie_ids: p.promo_movies ? p.promo_movies.map(pm => pm.movie.id) : []
    });
    setApiError('');
    setShowModal(true);
  };

  const handleMovieToggle = (movieId) => {
    setFormData(prev => {
      if (prev.movie_ids.includes(movieId)) {
        return { ...prev, movie_ids: prev.movie_ids.filter(id => id !== movieId) };
      }
      return { ...prev, movie_ids: [...prev.movie_ids, movieId] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setApiError('');
    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_tickets: parseInt(formData.min_tickets),
        is_active: formData.is_active,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        movie_ids: formData.movie_ids
      };

      if (formData.max_discount) {
        payload.max_discount = parseFloat(formData.max_discount);
      }
      if (formData.usage_limit) {
        payload.usage_limit = parseInt(formData.usage_limit);
      }

      if (modalMode === 'add') {
        await api.post('/promos', payload);
      } else {
        await api.put(`/promos/${selectedId}`, payload);
      }
      setShowModal(false);
      fetchPromos();
    } catch (err) {
      setApiError(err.response?.data?.message || `Failed to ${modalMode} promo config`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely erase this promo code?')) return;
    try {
      await api.delete(`/promos/${id}`);
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete promo code.');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
          <div className="glass-panel w-full max-w-3xl p-6 bg-brand-900 border-brand-primary/30 relative max-h-full overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-brand-700/50 pb-4">
              {modalMode === 'add' ? <Plus className="h-6 w-6 text-brand-primary" /> : <Pencil className="h-6 w-6 text-brand-primary" />}
              {modalMode === 'add' ? 'Create New Promo Code' : 'Edit Promo Configuration'}
            </h3>
            {apiError && (
              <div className="mb-6 text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-sm font-medium">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coupon Code</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary uppercase"
                    placeholder="e.g. DISKON50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary h-20 resize-none"
                  placeholder="Terms and conditions..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-brand-800/50 rounded-xl border border-brand-700/30">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type</label>
                  <select 
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount Value</label>
                  <input 
                    type="number" 
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    placeholder={formData.discount_type === 'percentage' ? "e.g. 15 for 15%" : "e.g. 20000"}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min. Tickets</label>
                  <input 
                    type="number" 
                    value={formData.min_tickets}
                    onChange={(e) => setFormData({...formData, min_tickets: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    min="1"
                    required
                  />
                </div>
                
                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max. Discount (Rp) <span className="text-gray-500 font-normal italic">Optional</span></label>
                    <input 
                      type="number" 
                      value={formData.max_discount}
                      onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                      className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                      placeholder="e.g. 50000"
                      min="0"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Usage Limit <span className="text-gray-500 font-normal italic">Optional</span></label>
                  <input 
                    type="number" 
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    placeholder="Total global quota"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valid From</label>
                  <input 
                    type="datetime-local" 
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valid Until</label>
                  <input 
                    type="datetime-local" 
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Specific Movies <span className="text-gray-500 font-normal italic">(Leave empty to apply to all movies)</span></label>
                <div className="flex flex-wrap gap-2.5 p-4 bg-brand-800 border border-brand-700/50 rounded-lg max-h-36 overflow-y-auto custom-scrollbar">
                  {movies.map(m => (
                    <label key={m.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors bg-brand-900/80 px-3 py-1.5 rounded-md border border-brand-700/30">
                      <input 
                        type="checkbox" 
                        checked={formData.movie_ids.includes(m.id)}
                        onChange={() => handleMovieToggle(m.id)}
                        className="accent-brand-primary"
                      />
                      <span className="truncate max-w-[200px]">{m.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 accent-brand-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">Active / Visible</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-lg">
                  Save Disount Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-800 p-6 rounded-xl border border-brand-700/50 shadow-lg">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1"><Tag className="inline-block h-6 w-6 mr-2 mb-1 text-brand-primary" />Promos Management</h2>
            <p className="text-gray-400 text-sm">Configure discount codes, percentages, and applicability rules.</p>
        </div>
        <button onClick={openAddModal} className="bg-brand-primary text-brand-900 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Design Promo
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel border-brand-700/30 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto bg-brand-900/40 w-full min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead className="sticky top-0 bg-brand-800 z-10 shadow-md">
                <tr>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Code</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Campaign</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Value</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Validity Window</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-700/30">
                {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading configurations...</td></tr>
                ) : promos.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No promos exist.</td></tr>
                ) : (
                promos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 text-white font-mono font-bold text-lg tracking-wider">
                          <span className="bg-brand-900 px-3 py-1 rounded border border-brand-700 shadow-inner">{promo.code}</span>
                        </td>
                        <td className="p-5 text-gray-300 font-medium">{promo.name}</td>
                        <td className="p-5">
                          <span className="text-brand-primary font-bold">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `Rp ${promo.discount_value.toLocaleString()} OFF`}
                          </span>
                        </td>
                        <td className="p-5 text-gray-400 text-sm">
                          {new Date(promo.valid_from).toLocaleDateString()} &rarr; {new Date(promo.valid_until).toLocaleDateString()}
                        </td>
                        <td className="p-5">
                          {promo.is_active ? 
                           <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase">Active</span> :
                           <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase">Deactivated</span>}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-3 items-center">
                            <button onClick={() => openEditModal(promo)} className="text-brand-primary hover:text-white transition-colors p-2 rounded hover:bg-brand-primary/20" title="Edit">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(promo.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-400/20" title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
