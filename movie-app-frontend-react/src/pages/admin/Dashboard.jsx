export default function AdminDashboard() {
  const stats = [
    { label: 'Total Movies', value: '24', change: '+3 this week' },
    { label: 'Active Schedules', value: '156', change: '+12 today' },
    { label: 'Total Bookings', value: '1,492', change: '+15% from last month' },
    { label: 'Active Promos', value: '4', change: '1 ending soon' },
  ];

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 border-brand-primary/10">
            <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-xs text-brand-primary">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Placeholder Chart Area */}
      <div className="glass-panel p-8 border-brand-700/30 h-96 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/50 to-brand-800 flex items-center justify-center">
            <p className="text-gray-500 font-medium tracking-widest uppercase">Analytics Chart Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
