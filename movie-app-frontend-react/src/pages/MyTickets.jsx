import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket, CalendarDays, Clock3, MapPin, CreditCard, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import api from '../services/api';

const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  used: 'bg-gray-500/15 text-gray-300 border border-gray-500/30',
  pending: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border border-red-500/30',
};

export default function MyTickets() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validatingId, setValidatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.flashMessage || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState([]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/transactions/my?per_page=20');
      const data = res.data?.data?.data || [];
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || 'Failed to load your tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const groupedTransactions = useMemo(
    () =>
      transactions
        .map((transaction) => ({
          ...transaction,
          seatNumbers: (transaction.tickets || []).map((ticket) => ticket.seat_number).sort((a, b) => a - b),
          combinedStatus: (transaction.tickets || []).some((ticket) => ticket.status === 'active')
            ? 'active'
            : (transaction.tickets || []).some((ticket) => ticket.status === 'pending')
              ? 'pending'
              : (transaction.tickets || []).some((ticket) => ticket.status === 'used')
                ? 'used'
                : 'cancelled',
        }))
        .filter((transaction) => {
          if (activeFilter === 'all') return true;
          return transaction.combinedStatus === activeFilter;
        }),
    [transactions, activeFilter]
  );

  const handleValidateTicket = async (ticketIds) => {
    const ids = Array.isArray(ticketIds) ? ticketIds : [ticketIds];
    if (!ids.length) return;

    try {
      setValidatingId(ids[0]);
      setSuccessMessage('');

      for (const ticketId of ids) {
        await api.post(`/tickets/${ticketId}/scan`);
      }

      setSuccessMessage('Ticket(s) validated successfully. Enjoy the movie!');
      await fetchTransactions();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to validate ticket.';
      setError(message);
    } finally {
      setValidatingId(null);
    }
  };

  const toggleExpanded = (transactionId) => {
    setExpandedIds((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleOpenPayment = (transaction) => {
    const firstTicket = (transaction.tickets || [])[0] || {};
    navigate('/payment', {
      state: {
        transactionId: transaction.id,
        schedule: firstTicket.schedule,
        selectedSeats: (transaction.tickets || []).map((ticket) => ticket.seat_number),
        paymentMethod: transaction.payment_method || 'credit_card',
        totalAmount: Number(transaction.total_amount || 0),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 max-w-6xl mx-auto px-6 lg:px-8 text-gray-400">
        Loading your tickets...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-6xl mx-auto px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-brand-primary text-sm uppercase tracking-[0.2em]">My tickets</p>
          <h1 className="text-3xl font-bold text-white mt-2">Booking history & validation</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm border border-brand-700/50 rounded-full px-4 py-2">
          <Ticket className="h-4 w-4 text-brand-primary" />
          Tickets are validated at the studio gate
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300 text-sm">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'pending', 'active', 'used', 'cancelled'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeFilter === filter
                  ? 'bg-brand-primary text-brand-900'
                  : 'border border-brand-700/50 bg-brand-900/40 text-gray-300 hover:border-brand-primary/60'
              }`}
            >
              {filter === 'all' ? 'All orders' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {groupedTransactions.length === 0 ? (
          <div className="glass-panel border border-brand-700/30 p-8 text-center text-gray-400">
            {transactions.length === 0
              ? 'You have not booked any tickets yet.'
              : `No orders match the ${activeFilter === 'all' ? 'selected' : activeFilter} filter.`}
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
            {groupedTransactions.map((transaction) => {
              const firstTicket = (transaction.tickets || [])[0] || {};
              const schedule = firstTicket.schedule || {};
              const movie = schedule.movie || {};
              const studio = schedule.studio || {};
              const statusClass = STATUS_STYLES[transaction.combinedStatus] || STATUS_STYLES.pending;
              const isExpanded = expandedIds.includes(transaction.id);

              return (
                <div key={transaction.id} className="glass-panel p-5 border border-brand-700/30">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-brand-primary font-semibold">#TRX-{transaction.id}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                          {transaction.combinedStatus}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
                        <p className="text-gray-400 mt-1">
                          {studio.name} • Seats {transaction.seatNumbers.join(', ')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-brand-primary" />
                          {new Date(schedule.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-brand-primary" />
                          {new Date(schedule.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(schedule.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-primary" />
                          {studio.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[240px]">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Payment</span>
                        <span className="text-white font-medium">{transaction.payment_status || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Total</span>
                        <span className="text-white font-medium">Rp {Number(transaction.total_amount || 0).toLocaleString('id-ID')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(transaction.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-700/50 bg-brand-900/40 px-4 py-2.5 text-sm text-gray-300 hover:bg-brand-800"
                      >
                        {isExpanded ? 'Hide details' : 'View details'}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 border-t border-brand-700/30 pt-5 space-y-4">
                      <div className="rounded-xl border border-brand-700/30 bg-brand-900/30 p-4">
                        <div className="flex items-center gap-2 text-brand-primary font-semibold mb-2">
                          <Wallet className="h-4 w-4" />
                          Order status
                        </div>

                        {transaction.payment_status === 'pending' ? (
                          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                            Payment gateway is not integrated yet. Use the temporary payment page to continue this booking.
                          </div>
                        ) : transaction.payment_status === 'success' ? (
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                            Payment already completed. Use the validation button below when you arrive at the studio.
                          </div>
                        ) : (
                          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                            This order is not valid for entry. Please complete payment or check the latest status.
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                        {transaction.tickets?.map((ticket) => (
                          <div key={ticket.id} className="rounded-xl border border-brand-700/30 bg-brand-900/40 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-400">Seat {ticket.seat_number}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[ticket.status] || STATUS_STYLES.pending}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {transaction.payment_status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(transaction)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-brand-primary/90"
                          >
                            Pay now
                          </button>
                        ) : transaction.combinedStatus === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleValidateTicket((transaction.tickets || []).filter((ticket) => ticket.status === 'active').map((ticket) => ticket.id))}
                            disabled={validatingId !== null}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-brand-primary/90 disabled:opacity-60"
                          >
                            {validatingId !== null ? 'Validating...' : 'Validate at Studio'}
                          </button>
                        ) : null}

                        {transaction.combinedStatus === 'active' && (
                          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
                            Warning: if validation is pressed, the ticket will be marked as used immediately.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-brand-700/30 bg-brand-900/30 p-4 text-sm text-gray-400">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-brand-primary" />
          Validation note
        </div>
        Use the validation action when entering the cinema. Tickets marked as active can be checked in once at the studio gate.
      </div>
    </div>
  );
}
