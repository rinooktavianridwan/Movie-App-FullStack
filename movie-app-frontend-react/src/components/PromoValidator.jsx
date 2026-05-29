import { useState } from 'react';
import api from '../services/api';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PromoValidator() {
  const [promoCode, setPromoCode] = useState('');
  const [totalPrice, setTotalPrice] = useState(150000); // Default simulated cart total
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: boolean, message: string, finalPrice: number, discount: number }

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!promoCode) return;
    
    setLoading(true);
    setResult(null);
    try {
      // Connecting to the backend promo validation endpoint
      const response = await api.post('/promos/validate', {
        promo_code: promoCode,
        total_amount: totalPrice,
        movie_ids: [1], // Default dummy value to pass validation testing from Home page sandbox
        seat_numbers: [1]
      });

      if (response.data?.data) {
        setResult({
          success: true,
          message: "Promo applied successfully!",
          finalPrice: response.data.data.final_price,
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
            <span className="text-lg font-bold text-white">Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>

        <form onSubmit={handleValidate} className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 bg-brand-800 border border-brand-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary uppercase tracking-widest placeholder:text-gray-500 placeholder:tracking-normal"
            />
            <button 
                type="submit" 
                disabled={loading || !promoCode}
                className="btn-primary py-2 px-4 rounded-lg flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply'}
            </button>
        </form>

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
