import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, TicketPercent, Clock3, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PromosPage() {
  const { token } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPromos = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/promos?page=1&per_page=50');
        const list = res.data?.data?.data || [];
        const now = new Date();

        const availablePromos = list.filter((promo) => {
          const validFrom = new Date(promo.valid_from);
          const validUntil = new Date(promo.valid_until);
          return promo.is_active && validFrom <= now && validUntil >= now;
        });

        setPromos(availablePromos);
      } catch (err) {
        console.error('Failed to fetch promos:', err);
        setError(err.response?.data?.message || 'Failed to load available promos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, [token]);

  const promoCards = useMemo(() => {
    return promos.map((promo) => ({
      ...promo,
      discountLabel:
        promo.discount_type === 'percentage'
          ? `${promo.discount_value}% OFF`
          : `Rp ${Number(promo.discount_value || 0).toLocaleString('id-ID')} OFF`,
    }));
  }, [promos]);

  if (!token) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="glass-panel border border-brand-700/30 p-10 text-center">
          <Gift className="h-12 w-12 mx-auto text-brand-primary mb-4" />
          <h1 className="text-3xl font-bold text-white mb-3">Available promotions</h1>
          <p className="text-gray-400 mb-6">
            Sign in to see active promo codes and special offers for your next booking.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-5 py-3 font-bold text-brand-900"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-6xl mx-auto px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-brand-primary text-sm uppercase tracking-[0.2em]">Promos</p>
          <h1 className="text-3xl font-bold text-white mt-2">Available offers</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm border border-brand-700/50 rounded-full px-4 py-2">
          <TicketPercent className="h-4 w-4 text-brand-primary" />
          Active & valid only
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading promo offers...</div>
      ) : promoCards.length === 0 ? (
        <div className="glass-panel border border-brand-700/30 p-8 text-center text-gray-400">
          There are no active promos at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {promoCards.map((promo) => (
            <div key={promo.id} className="glass-panel border border-brand-700/30 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-brand-primary text-xs uppercase tracking-[0.2em]">Promo</p>
                  <h2 className="text-2xl font-bold text-white mt-2">{promo.name}</h2>
                </div>
                <div className="rounded-xl border border-brand-primary/40 bg-brand-primary/10 px-3 py-2 text-sm font-bold text-brand-primary">
                  {promo.discountLabel}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-brand-700/50 bg-brand-900/30 p-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Code</p>
                <p className="mt-2 font-mono text-2xl font-bold text-white">{promo.code}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-brand-primary" />
                  <span>
                    Valid: {new Date(promo.valid_from).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
                    {new Date(promo.valid_until).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-primary mt-0.5" />
                  <span>{promo.description || 'Available for selected movie and ticket purchases.'}</span>
                </div>
                {promo.minimum_amount ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Min purchase: Rp {Number(promo.minimum_amount).toLocaleString('id-ID')}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(promo.code)}
                className="mt-auto rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-4 py-3 text-sm font-bold text-brand-primary transition hover:bg-brand-primary/20"
              >
                Copy code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
