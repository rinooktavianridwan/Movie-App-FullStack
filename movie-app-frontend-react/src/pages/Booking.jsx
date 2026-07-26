import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get(`/schedules/${id}`);
        setSchedule(res.data?.data || null);
        setSelectedSeats([]);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        setError(err.response?.data?.message || 'Failed to load schedule.');
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [id]);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const res = await api.get(`/tickets/by-schedule/${id}/seats`);
        setBookedSeats(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch booked seats:', err);
      }
    };
    if (id) {
      fetchBookedSeats();
    }
  }, [id]);

  const seatCapacity = schedule?.studio?.seat_capacity || 0;
  const pricePerTicket = Number(schedule?.price || 0);
  const seatsPerRow = seatCapacity > 80 ? 12 : 8;
  const totalRows = Math.ceil(seatCapacity / seatsPerRow);

  const bookedSeatSet = useMemo(() => new Set(bookedSeats), [bookedSeats]);

  const toggleSeat = (seatNumber) => {
    if (bookedSeatSet.has(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleCheckout = async () => {
    if (!schedule || selectedSeats.length === 0) return;
    setProcessing(true);
    setSubmitError('');
    setSuccessMessage('');
    try {
      await api.post('/transactions', {
        schedule_id: schedule.id,
        seat_numbers: [...selectedSeats].sort((a, b) => a - b),
        payment_method: paymentMethod,
        promo_code: promoCode || undefined,
      });
      setSuccessMessage('Booking created successfully. Please complete payment.');
      setSelectedSeats([]);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading schedule...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  if (!schedule) {
    return <div className="min-h-screen flex items-center justify-center text-white">Schedule not found.</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Select Your Seats</h1>
          <p className="text-gray-400 mt-2">
            {schedule.movie?.title} • {schedule.studio?.name} •{' '}
            {new Date(schedule.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-brand-700/50 rounded-lg text-gray-300 hover:bg-brand-800 transition-colors"
        >
          Cancel Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Seat Layout Map */}
        <div className="lg:col-span-2 glass-panel p-8 border-brand-700/30 flex flex-col items-center">
          <div className="w-full max-w-2xl h-8 mb-16 relative">
            <div className="absolute inset-x-0 bottom-0 h-10 border-t-4 border-brand-primary/50 rounded-t-[50%] blur-[1px]"></div>
            <div className="absolute inset-0 bg-brand-primary/10 rounded-t-[50%] blur-xl"></div>
            <p className="text-center text-brand-primary text-xs tracking-[0.5em] uppercase absolute w-full top-2">Screen</p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-xl">
            {Array.from({ length: totalRows }).map((_, rowIndex) => {
              const rowLabel = String.fromCharCode(65 + rowIndex);
              return (
                <div key={rowLabel} className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-bold w-6 text-center">{rowLabel}</span>
                  <div className="flex gap-2 lg:gap-4 justify-center flex-1 flex-wrap">
                    {Array.from({ length: seatsPerRow }).map((__, colIndex) => {
                      const seatNumber = rowIndex * seatsPerRow + colIndex + 1;
                      if (seatNumber > seatCapacity) return null;
                      const isSelected = selectedSeats.includes(seatNumber);
                      const isReserved = bookedSeatSet.has(seatNumber);

                      return (
                        <div key={seatNumber} className="flex items-center">
                          <button
                            disabled={isReserved}
                            onClick={() => toggleSeat(seatNumber)}
                            className={`
                              w-8 h-8 rounded-t-lg rounded-b-sm font-medium text-[10px] transition-all duration-200
                              ${
                                isReserved
                                  ? 'bg-gray-600/50 cursor-not-allowed border border-gray-700/50'
                                  : isSelected
                                    ? 'bg-brand-primary text-brand-900 border-b-4 border-brand-900 shadow-[0_0_15px_rgba(252,211,77,0.4)] transform -translate-y-1'
                                    : 'bg-brand-800 text-gray-400 border border-brand-700 hover:bg-brand-700'
                              }
                            `}
                          >
                            {seatNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-gray-500 font-bold w-6 text-center">{rowLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex gap-6 justify-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-brand-800 border border-brand-700"></div>
              <span className="text-xs text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-brand-primary"></div>
              <span className="text-xs text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-gray-600 border border-gray-700"></div>
              <span className="text-xs text-gray-400">Reserved</span>
            </div>
          </div>
        </div>

        {/* Checkout Summary Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-8 border-brand-primary/20 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-brand-700/50 pb-4">Booking Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Movie:</span>
                <span className="text-white font-semibold">{schedule.movie?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Studio:</span>
                <span className="text-white">{schedule.studio?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">{new Date(schedule.date).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Time:</span>
                <span className="text-white">
                  {new Date(schedule.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(schedule.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Seats:</span>
                <span className="text-white font-bold">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-700/50 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price per ticket:</span>
                <span className="text-white">Rp {pricePerTicket.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-700/50">
              <div className="flex justify-between items-end">
                <span className="text-gray-300 font-medium">Total Amount</span>
                <span className="text-3xl font-extrabold text-brand-primary">
                  Rp {(selectedSeats.length * pricePerTicket).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Payment Method</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="accent-brand-primary"
                  />
                  Credit Card
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={paymentMethod === 'e_wallet'}
                    onChange={() => setPaymentMethod('e_wallet')}
                    className="accent-brand-primary"
                  />
                  E-Wallet
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Promo Code (optional)</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full bg-brand-800 border border-brand-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary uppercase"
                placeholder="PROMO CODE"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {submitError}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            <button
              disabled={selectedSeats.length === 0 || processing}
              onClick={handleCheckout}
              className={`
                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${
                  selectedSeats.length > 0 && !processing
                    ? 'bg-brand-primary text-brand-900 hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 hover:-translate-y-1'
                    : 'bg-brand-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {processing ? 'Processing...' : 'Confirm Order'}
            </button>
            <p className="text-xs text-center text-gray-500">Creates a booking and reserves your seats.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
