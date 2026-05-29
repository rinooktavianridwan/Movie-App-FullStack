import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Generates 5 rows of 8 seats
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleSeat = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    setProcessing(true);
    
    // Simulate booking process connecting to backend order module
    setTimeout(() => {
        setProcessing(false);
        alert(`Successfully booked seats: ${selectedSeats.join(', ')}!\nIn a real app, this redirects to successful Order screen.`);
        navigate(`/`);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Select Your Seats</h1>
            <p className="text-gray-400 mt-2">Movie ID: {id} • Studio 1 • 19:00 PM</p>
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
            {/* Screen Curve Indicator */}
            <div className="w-full max-w-2xl h-8 mb-16 relative">
               <div className="absolute inset-x-0 bottom-0 h-10 border-t-4 border-brand-primary/50 rounded-t-[50%] blur-[1px]"></div>
               <div className="absolute inset-0 bg-brand-primary/10 rounded-t-[50%] blur-xl"></div>
               <p className="text-center text-brand-primary text-xs tracking-[0.5em] uppercase absolute w-full top-2">Screen</p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-xl">
               {rows.map(row => (
                   <div key={row} className="flex items-center justify-between gap-2">
                       <span className="text-gray-500 font-bold w-6 text-center">{row}</span>
                       <div className="flex gap-2 lg:gap-4 justify-center flex-1">
                           {columns.map(col => {
                               // Make middle gap
                               const isMiddleGap = col === 4;
                               const seatId = `${row}${col}`;
                               const isSelected = selectedSeats.includes(seatId);
                               const isReserved = row === 'C' && (col === 3 || col === 4); // Dummy reserved seats
                               
                               return (
                                   <div key={seatId} className={`flex items-center ${isMiddleGap ? 'mr-8' : ''}`}>
                                        <button 
                                          disabled={isReserved}
                                          onClick={() => toggleSeat(seatId)}
                                          className={`
                                              w-8 h-8 rounded-t-lg rounded-b-sm font-medium text-xs transition-all duration-200
                                              ${isReserved ? 'bg-gray-600/50 cursor-not-allowed border border-gray-700/50' : 
                                                isSelected ? 'bg-brand-primary text-brand-900 border-b-4 border-brand-900 shadow-[0_0_15px_rgba(252,211,77,0.4)] transform -translate-y-1' : 
                                                'bg-brand-800 text-gray-400 border border-brand-700 hover:bg-brand-700'}
                                          `}
                                        >
                                            {/* {col} */}
                                        </button>
                                   </div>
                               )
                           })}
                       </div>
                       <span className="text-gray-500 font-bold w-6 text-center">{row}</span>
                   </div>
               ))}
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
            <div className="glass-panel p-8 border-brand-primary/20 sticky top-28">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-brand-700/50 pb-4">Booking Summary</h3>
                
                <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Seats selected:</span>
                         <span className="text-white font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Price per ticket:</span>
                         <span className="text-white">Rp 50.000</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Convenience fee:</span>
                         <span className="text-white">Rp 2.000</span>
                     </div>
                </div>

                <div className="pt-4 border-t border-brand-700/50 mb-8">
                     <div className="flex justify-between items-end">
                         <span className="text-gray-300 font-medium">Total Amount</span>
                         <span className="text-3xl font-extrabold text-brand-primary">
                             Rp {(selectedSeats.length * 50000 + (selectedSeats.length > 0 ? 2000 : 0)).toLocaleString('id-ID')}
                         </span>
                     </div>
                </div>

                <button 
                    disabled={selectedSeats.length === 0 || processing}
                    onClick={handleCheckout}
                    className={`
                        w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                        ${selectedSeats.length > 0 && !processing 
                            ? 'bg-brand-primary text-brand-900 hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 hover:-translate-y-1' 
                            : 'bg-brand-800 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    {processing ? 'Processing...' : 'Confirm Order'}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">Takes you to the secure payment endpoint</p>
            </div>
        </div>
      </div>
    </div>
  );
}
