import { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Plus, Pencil, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // TMDB Fetch
  const [isFetchingTMDB, setIsFetchingTMDB] = useState(false);
  const [tmdbStatus, setTMDBStatus] = useState(null); // { type: 'success'|'error', message: string }

  // CRUD Modal
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [crudMode, setCrudMode] = useState('add');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({ title: '', duration: '', overview: '', genre_ids: [] });
  const [posterFile, setPosterFile] = useState(null);
  const [crudError, setCrudError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movies?per_page=100');
      setMovies(response.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres?per_page=100');
      setGenres(response.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const handleFetchTMDB = async () => {
    setIsFetchingTMDB(true);
    setTMDBStatus(null);
    try {
      await api.post('/admin/movies/fetch-tmdb');
      setTMDBStatus({ type: 'success', message: 'Berhasil fetch movie dari TMDB!' });
      fetchMovies();
    } catch (err) {
      setTMDBStatus({ type: 'error', message: err.response?.data?.message || 'Gagal fetch movie dari TMDB' });
    } finally {
      setIsFetchingTMDB(false);
    }
  };

  const openAddModal = () => {
    setCrudMode('add');
    setSelectedMovie(null);
    setFormData({ title: '', duration: '', overview: '', genre_ids: [] });
    setPosterFile(null);
    setCrudError('');
    setShowCrudModal(true);
  };

  const openEditModal = (movie) => {
    setCrudMode('edit');
    setSelectedMovie(movie);
    setFormData({ 
      title: movie.title, 
      duration: movie.duration, 
      overview: movie.overview, 
      genre_ids: movie.genres ? movie.genres.map((g) => g.id) : [] 
    });
    setPosterFile(null);
    setCrudError('');
    setShowCrudModal(true);
  };

  const handleGenreToggle = (genreId) => {
    setFormData(prev => {
      if (prev.genre_ids.includes(genreId)) {
        return { ...prev, genre_ids: prev.genre_ids.filter(id => id !== genreId) };
      }
      return { ...prev, genre_ids: [...prev.genre_ids, genreId] };
    });
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    if (formData.genre_ids.length === 0) {
      setCrudError('Please select at least one genre');
      return;
    }
    setIsSaving(true);
    setCrudError('');

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('duration', formData.duration);
      formPayload.append('overview', formData.overview);
      formData.genre_ids.forEach(id => formPayload.append('genre_ids', id));
      if (posterFile) {
        formPayload.append('poster', posterFile);
      }

      if (crudMode === 'add') {
        await api.post('/movies', formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/movies/${selectedMovie.id}`, formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowCrudModal(false);
      fetchMovies();
    } catch (err) {
      setCrudError(err.response?.data?.message || `Failed to ${crudMode} movie`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? This will permanently remove it from the system.')) return;
    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">

      {/* Status Fetch TMDB */}
      {tmdbStatus && (
        <div className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-sm font-medium ${tmdbStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {tmdbStatus.message}
          <button className="ml-4 text-white/80 hover:text-white" onClick={() => setTMDBStatus(null)}><X className="inline h-4 w-4" /></button>
        </div>
      )}

      {/* Modal Manual CRUD */}
      {showCrudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm py-10">
          <div className="glass-panel w-full max-w-2xl max-h-full overflow-y-auto p-8 bg-brand-900 border-brand-primary/30 relative custom-scrollbar">
            <button onClick={() => setShowCrudModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-brand-700/50 pb-4">
              {crudMode === 'add' ? <Plus className="h-6 w-6 text-brand-primary" /> : <Pencil className="h-6 w-6 text-brand-primary" />}
              {crudMode === 'add' ? 'Add New Movie' : 'Edit Movie'}
            </h3>
            
            {crudError && (
              <div className="mb-6 text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-sm">
                {crudError}
              </div>
            )}

            <form onSubmit={handleCrudSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Overview / Plot</label>
                <textarea 
                  value={formData.overview}
                  onChange={(e) => setFormData({...formData, overview: e.target.value})}
                  className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors h-28 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Genres</label>
                <div className="flex flex-wrap gap-3 p-4 bg-brand-800 border border-brand-700/50 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                  {genres.length === 0 ? (
                    <p className="text-gray-500 text-sm">No genres available. Add them in Manage Genres first.</p>
                  ) : (
                    genres.map(g => (
                      <label key={g.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors bg-brand-900 px-3 py-1.5 rounded-md border border-brand-700/30">
                        <input 
                          type="checkbox" 
                          checked={formData.genre_ids.includes(g.id)}
                          onChange={() => handleGenreToggle(g.id)}
                          className="accent-brand-primary"
                        />
                        <span>{g.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Movie Poster (Optional)</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center gap-2 bg-brand-800 border border-brand-700/50 hover:border-brand-primary/50 text-gray-300 rounded-lg px-4 py-3 cursor-pointer transition-colors w-full">
                    <ImageIcon className="h-5 w-5" />
                    <span>{posterFile ? posterFile.name : 'Choose an image file...'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPosterFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {posterFile && (
                    <button type="button" onClick={() => setPosterFile(null)} className="text-red-400 hover:text-red-300 p-3 bg-brand-800 rounded-lg border border-red-500/20">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-brand-700/50">
                <button type="button" onClick={() => setShowCrudModal(false)} className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-brand-primary text-brand-900 font-bold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-brand-primary/20">
                  {isSaving ? 'Saving...' : 'Save Movie Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-800 p-6 rounded-xl border border-brand-700/50 shadow-lg">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Movies Directory</h2>
            <p className="text-gray-400 text-sm">Manage all titles available in the system.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleFetchTMDB} disabled={isFetchingTMDB} className="bg-brand-900 text-white border border-brand-700 px-4 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isFetchingTMDB ? 'animate-spin' : ''}`} /> Fetch TMDB
          </button>
          <button onClick={openAddModal} className="bg-brand-primary text-brand-900 px-6 py-2.5 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add New Movie
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="glass-panel border-brand-700/30 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto bg-brand-900/40 w-full min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead className="sticky top-0 bg-brand-800 z-10 shadow-md">
                <tr>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider w-20">ID</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Genres</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider">Duration</th>
                <th className="p-5 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-700/30">
                {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                ) : movies.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No movies found in the database.</td></tr>
                ) : (
                movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 text-gray-400 group-hover:text-white transition-colors">#{movie.id}</td>
                        <td className="p-5 text-white font-medium">
                          <div className="flex items-center gap-3">
                            <span className="truncate max-w-[200px] md:max-w-xs">{movie.title}</span>
                          </div>
                        </td>
                        <td className="p-5 text-gray-400 whitespace-normal">
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {movie.genres && movie.genres.length > 0 ? (
                              movie.genres.map((g) => (
                                <span key={g.id} className="inline-block px-2 py-0.5 bg-brand-700/40 text-brand-primary text-xs rounded-full border border-brand-primary/20">
                                  {g.name}
                               </span>
                              ))
                            ) : (
                               <span className="text-gray-500 italic text-sm">No genres</span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-gray-400">{movie.duration} min</td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => openEditModal(movie)} className="text-brand-primary hover:text-white transition-colors p-2 rounded hover:bg-brand-primary/20" title="Edit">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(movie.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-400/20" title="Delete">
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
