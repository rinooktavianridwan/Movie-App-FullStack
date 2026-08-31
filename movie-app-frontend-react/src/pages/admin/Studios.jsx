import { useState, useEffect } from 'react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { Pencil, Trash2, Plus, X, Armchair } from 'lucide-react';

export default function AdminStudios() {
  const [studios, setStudios] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    seat_capacity: '',
    facility_ids: []
  });
  const [apiError, setApiError] = useState('');

  const fetchStudios = async (p = page) => {
    setLoading(true);
    try {
      const response = await api.get(`/studios?page=${p}&per_page=10`);
      const d = response.data?.data;
      setStudios(d?.data || []);
      setPage(d?.page || 1);
      setTotalPages(d?.total_page || 1);
    } catch (err) {
      console.error('Error fetching studios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities?per_page=100');
      setFacilities(response.data?.data?.data || []);
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  useEffect(() => {
    fetchStudios(1);
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedId(null);
    setFormData({ name: '', seat_capacity: '', facility_ids: [] });
    setApiError('');
    setShowModal(true);
  };

  const openEditModal = (studio) => {
    setModalMode('edit');
    setSelectedId(studio.id);
    setFormData({
      name: studio.name,
      seat_capacity: studio.seat_capacity,
      facility_ids: studio.facilities ? studio.facilities.map((f) => f.id) : []
    });
    setApiError('');
    setShowModal(true);
  };

  const handleFacilityToggle = (facilityId) => {
    setFormData((prev) => {
      if (prev.facility_ids.includes(facilityId)) {
        return { ...prev, facility_ids: prev.facility_ids.filter((id) => id !== facilityId) };
      }
      return { ...prev, facility_ids: [...prev.facility_ids, facilityId] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setApiError('');
    try {
      const payload = {
        name: formData.name,
        seat_capacity: parseInt(formData.seat_capacity),
        facility_ids: formData.facility_ids
      };

      if (modalMode === 'add') {
        await api.post('/studios', payload);
      } else {
        await api.put(`/studios/${selectedId}`, payload);
      }
      setShowModal(false);
      fetchStudios(1);
    } catch (err) {
      setApiError(err.response?.data?.message || `Failed to ${modalMode} studio`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this studio? This action cannot be undone.')) return;
    try {
      await api.delete(`/studios/${id}`);
      fetchStudios(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete studio. It might be in use by schedules.');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 bg-brand-900 border-brand-primary/30 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {modalMode === 'add' ? <Plus className="h-5 w-5 text-brand-primary" /> : <Pencil className="h-5 w-5 text-brand-primary" />}
              {modalMode === 'add' ? 'Add New Studio' : 'Edit Studio'}
            </h3>
            {apiError && (
              <div className="mb-4 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Studio Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. Studio 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Seat Capacity</label>
                <input
                  type="number"
                  value={formData.seat_capacity}
                  onChange={(e) => setFormData({ ...formData, seat_capacity: e.target.value })}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. 100"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Facilities</label>
                <div className="flex flex-wrap gap-2.5 p-4 bg-brand-800 border border-brand-700/50 rounded-lg max-h-36 overflow-y-auto custom-scrollbar">
                  {facilities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No facilities available.</p>
                  ) : (
                    facilities.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors bg-brand-900/80 px-3 py-1.5 rounded-md border border-brand-700/30">
                        <input
                          type="checkbox"
                          checked={formData.facility_ids.includes(f.id)}
                          onChange={() => handleFacilityToggle(f.id)}
                          className="accent-brand-primary"
                        />
                        <span>{f.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 transition-colors">
                  Save Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-brand-800 p-6 rounded-xl border border-brand-700/50 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1"><Armchair className="inline-block h-6 w-6 mr-2 mb-1 text-brand-primary" />Studios Directory</h2>
          <p className="text-gray-400 text-sm">Manage theater studios and their facilities.</p>
        </div>
        <button onClick={openAddModal} className="bg-brand-primary text-brand-900 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Studio
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
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Seats</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Facilities</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-700/30">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading studios...</td></tr>
              ) : studios.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No studios found.</td></tr>
              ) : (
                studios.map((studio) => (
                  <tr key={studio.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 text-gray-400 group-hover:text-white transition-colors">#{studio.id}</td>
                    <td className="p-5 text-white font-medium">{studio.name}</td>
                    <td className="p-5 text-gray-400">{studio.seat_capacity}</td>
                    <td className="p-5 text-gray-400 whitespace-normal">
                      <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {studio.facilities && studio.facilities.length > 0 ? (
                          studio.facilities.map((f) => (
                            <span key={f.id} className="inline-block px-2 py-0.5 bg-brand-700/40 text-brand-primary text-xs rounded-full border border-brand-primary/20">
                              {f.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic text-sm">No facilities</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-3 items-center mt-2">
                      <button onClick={() => openEditModal(studio)} className="text-brand-primary hover:text-white transition-colors p-2 rounded hover:bg-brand-primary/20" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(studio.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-400/20" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={fetchStudios} />
      </div>
    </div>
  );
}
