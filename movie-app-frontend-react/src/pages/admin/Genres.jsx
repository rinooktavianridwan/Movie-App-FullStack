import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [name, setName] = useState('');
  const [apiError, setApiError] = useState('');

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const response = await api.get('/genres?per_page=100'); // fetch a decent amount
      setGenres(response.data?.data?.data || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedGenre(null);
    setName('');
    setApiError('');
    setShowModal(true);
  };

  const openEditModal = (genre) => {
    setModalMode('edit');
    setSelectedGenre(genre);
    setName(genre.name);
    setApiError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setApiError('');
    try {
      if (modalMode === 'add') {
        await api.post('/genres', { name });
      } else {
        await api.put(`/genres/${selectedGenre.id}`, { name });
      }
      setShowModal(false);
      fetchGenres();
    } catch (err) {
      setApiError(err.response?.data?.message || `Failed to ${modalMode} genre`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this genre? This action cannot be undone.')) return;
    try {
      await api.delete(`/genres/${id}`);
      fetchGenres();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete genre. It might be in use.');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 bg-brand-900 border-brand-primary/30 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {modalMode === 'add' ? <Plus className="h-5 w-5 text-brand-primary" /> : <Pencil className="h-5 w-5 text-brand-primary" />}
              {modalMode === 'add' ? 'Add New Genre' : 'Edit Genre'}
            </h3>
            {apiError && (
              <div className="mb-4 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Genre Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. Science Fiction"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 transition-colors">
                  Save Genre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-brand-800 p-6 rounded-xl border border-brand-700/50 shadow-lg">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Genres Directory</h2>
            <p className="text-gray-400 text-sm">Manage movie classification categories.</p>
        </div>
        <button onClick={openAddModal} className="bg-brand-primary text-brand-900 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Genre
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel border-brand-700/30 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto bg-brand-900/40 w-full min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-brand-800 z-10 shadow-md">
                <tr>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider w-24">ID</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-700/30">
                {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                ) : genres.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">No genres found.</td></tr>
                ) : (
                genres.map((genre) => (
                    <tr key={genre.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 text-gray-400 group-hover:text-white transition-colors">#{genre.id}</td>
                        <td className="p-5 text-white font-medium">{genre.name}</td>
                        <td className="p-5 text-right flex justify-end gap-3">
                            <button onClick={() => openEditModal(genre)} className="text-brand-primary hover:text-white transition-colors p-2 rounded hover:bg-brand-primary/20" title="Edit">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(genre.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-400/20" title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </button>
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
