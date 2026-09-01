import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(booking.paymentMethod || 'credit_card');

  const schedule = booking.schedule || null;
  const selectedSeats = booking.selectedSeats || [];
  const totalAmount = Number(booking.totalAmount || 0);
  const transactionId = booking.transactionId;

  const movieTitle = useMemo(() => {
    return schedule?.movie?.title || 'Movie Ticket';
  }, [schedule]);

  const studioName = schedule?.studio?.name || 'Studio';

  const handlePayment = async () => {
    if (!transactionId) {
      setError('Payment session is missing. Please open your ticket list and retry.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      await api.post(`/transactions/${transactionId}/payment`, {
        payment_status: 'success',
        payment_note: `${selectedPaymentMethod === 'credit_card' ? 'Credit Card' : 'E-Wallet'} payment via temporary checkout`,
      });

      navigate('/my-tickets', {
        state: {
          flashMessage: 'Payment successful! Your tickets are now ready to validate at the studio gate.',
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!transactionId || !schedule) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-3xl mx-auto px-6 lg:px-8">
        <div className="glass-panel border border-brand-700/30 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Payment data not found</h1>
          <p className="text-gray-400 mb-6">
            Your booking was created, but the payment session was not found.
          </p>
          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 font-bold text-brand-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-5xl mx-auto px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-brand-primary text-sm uppercase tracking-[0.2em]">Complete payment</p>
        <h1 className="text-3xl font-bold text-white mt-2">Secure checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
        <div className="glass-panel border border-brand-700/30 p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-brand-primary/15 p-3 text-brand-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment details</h2>
              <p className="text-sm text-gray-400">Temporary payment flow for booking confirmation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-brand-700/30 bg-brand-900/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Method</span>
                <span className="text-white font-medium flex items-center gap-2">
                  {selectedPaymentMethod === 'credit_card' ? <CreditCard className="h-4 w-4 text-brand-primary" /> : <Wallet className="h-4 w-4 text-brand-primary" />}
                  {selectedPaymentMethod === 'credit_card' ? 'Credit Card' : 'E-Wallet'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 rounded-lg border border-brand-700/50 bg-brand-800/60 px-3 py-2 text-sm text-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={selectedPaymentMethod === 'credit_card'}
                    onChange={() => setSelectedPaymentMethod('credit_card')}
                    className="accent-brand-primary"
                  />
                  Credit Card
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-brand-700/50 bg-brand-800/60 px-3 py-2 text-sm text-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={selectedPaymentMethod === 'e_wallet'}
                    onChange={() => setSelectedPaymentMethod('e_wallet')}
                    className="accent-brand-primary"
                  />
                  E-Wallet
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Cardholder / Wallet name</label>
              <input
                type="text"
                defaultValue="Movie App User"
                className="w-full rounded-xl border border-brand-700/50 bg-brand-800 px-4 py-3 text-white outline-none focus:border-brand-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Card / Wallet number</label>
              <input
                type="text"
                defaultValue="•••• •••• •••• 4242"
                className="w-full rounded-xl border border-brand-700/50 bg-brand-800 px-4 py-3 text-white outline-none focus:border-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Expiry</label>
                <input
                  type="text"
                  defaultValue="12/29"
                  className="w-full rounded-xl border border-brand-700/50 bg-brand-800 px-4 py-3 text-white outline-none focus:border-brand-primary"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">CVV</label>
                <input
                  type="text"
                  defaultValue="***"
                  className="w-full rounded-xl border border-brand-700/50 bg-brand-800 px-4 py-3 text-white outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="glass-panel border border-brand-primary/20 p-7">
          <h2 className="text-xl font-bold text-white mb-5">Order summary</h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{movieTitle}</p>
                <p className="text-gray-400 mt-1">{studioName}</p>
              </div>
              <div className="text-right text-brand-primary font-bold">Rp {Number(totalAmount || 0).toLocaleString('id-ID')}</div>
            </div>

            <div className="rounded-xl border border-brand-700/30 bg-brand-900/30 p-4 text-gray-300">
              <div className="flex justify-between">
                <span>Seats</span>
                <span className="text-white font-medium">{selectedSeats.length ? selectedSeats.join(', ') : '-'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Date</span>
                <span className="text-white">
                  {new Date(schedule.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Time</span>
                <span className="text-white">
                  {new Date(schedule.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-700/50 flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-3xl font-extrabold text-brand-primary">
                Rp {Number(totalAmount || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={processing}
            className="mt-8 w-full rounded-xl bg-brand-primary px-5 py-4 text-base font-bold text-brand-900 transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {processing ? 'Processing payment...' : 'Pay now'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="mt-3 w-full rounded-xl border border-brand-700/50 bg-brand-900/40 px-5 py-3 text-sm text-gray-300 transition hover:bg-brand-800"
          >
            Back to tickets
          </button>
        </div>
      </div>
    </div>
  );
}
