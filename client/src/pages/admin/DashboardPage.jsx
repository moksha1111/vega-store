import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import Spinner from '../../components/Spinner';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders'),
      api.get('/users'),
    ]).then(([products, orders, users]) => {
      const totalRevenue = orders.data.reduce((sum, o) => sum + o.totalPrice, 0);
      const pending = orders.data.filter(o => o.status === 'pending').length;
      setStats({ products: products.data.total, orders: orders.data.length, users: users.data.length, revenue: totalRevenue, pending });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    { label: 'Total Products', value: stats?.products, icon: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats?.orders, icon: '🛒', color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Orders', value: stats?.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Customers', value: stats?.users, icon: '👥', color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: `$${stats?.revenue?.toFixed(2)}`, icon: '💰', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.label} className={`rounded-2xl p-6 ${card.color} bg-opacity-20`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{card.value}</div>
            <div className="text-sm font-medium text-gray-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
