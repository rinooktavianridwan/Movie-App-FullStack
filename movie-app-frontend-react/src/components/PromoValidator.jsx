import { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PromoValidator() {
  const { token } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [ticketCount, setTicketCount] = useState(1);
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: boolean, message: string, finalPrice: number, discount: number }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies?per_page=50');
        const list = res.data?.data?.data || [];
        setMovies(list);
        setSelectedMovieId(list[0]?.id ? String(list[0].id) : '');
      } catch (err) {
        console.error('Failed to fetch movies for promo validation', err);
      }
    };
    fetchMovies();
  }, []);

  const isFormValid = token && promoCode && selectedMovieId && ticketCount > 0 && Number(totalPrice) > 0;

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setResult(null);
    try {
      const seatNumbers = Array.from({ length: ticketCount }, (_, i) => i + 1);
      const response = await api.post('/promos/validate', {
        promo_code: promoCode,
        total_amount: Number(totalPrice),
        movie_ids: [parseInt(selectedMovieId, 10)],
        seat_numbers: seatNumbers
      });

      if (response.data?.data) {
        setResult({
          success: response.data.data.is_valid,
          message: response.data.data.message || 'Promo validation result retrieved',
          finalPrice: response.data.data.final_amount,
          discount: response.data.data.discount_amount
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || "Invalid or expired promo code",
        finalPrice: totalPrice,
        discount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 max-w-md w-full mx-auto relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none"></div>

        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-primary" />
            Apply Promo Code
        </h3>
        <p className="text-gray-400 text-sm mb-6">Enter your discount code for the best deals!</p>

        <div className="bg-brand-900/50 rounded-lg p-4 mb-6 border border-brand-700/50 flex justify-between items-center">
            <span className="text-gray-400">Total Price:</span>
            <span className="text-lg font-bold text-white">Rp {Number(totalPrice).toLocaleString('id-ID')}</span>
        </div>

        <form onSubmit={handleValidate} className="space-y-3 mb-4">
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
              disabled={movies.length === 0}
            >
              <option value="" disabled>
                {movies.length === 0 ? 'No movies available' : 'Select Movie'}
              </option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                placeholder="Tickets"
              />
              <input
                type="number"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                placeholder="Total Price"
              />
            </div>

            <div className="flex gap-2">
              <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE"
                  className="flex-1 bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary uppercase tracking-widest placeholder:text-gray-500 placeholder:tracking-normal"
              />
              <button 
                  type="submit" 
                  disabled={loading || !isFormValid}
                  className="btn-primary py-2 px-4 rounded-lg flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply'}
              </button>
            </div>
        </form>

        {!token && (
          <p className="text-xs text-yellow-400">Please log in to validate a promo code.</p>
        )}

        {result && (
            <div className={`p-4 rounded-lg flex gap-3 text-sm animate-fade-in-up border ${result.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {result.success ? <CheckCircle className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                <div>
                    <p className="font-medium mb-1">{result.message}</p>
                    {result.success && (
                        <div className="space-y-1">
                            <p className="text-gray-400">Discount: -Rp {result.discount.toLocaleString('id-ID')}</p>
                            <p className="text-lg font-bold text-white mt-1 pt-2 border-t border-green-500/20">
                                Final: Rp {result.finalPrice.toLocaleString('id-ID')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
