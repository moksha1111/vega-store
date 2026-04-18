import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LINKS = [
  { to: '/admin', label: '📊 Dashboard', exact: true },
  { to: '/admin/products', label: '📦 Products' },
  { to: '/admin/orders', label: '🛒 Orders' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/visitors', label: '👁 Visitors' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 gap-2 fixed h-full">
        <Link to="/" className="text-2xl font-extrabold text-indigo-400 mb-6">VEGA Admin</Link>
        {LINKS.map(link => (
          <Link key={link.to} to={link.to} className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${(link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to)) ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>{link.label}</Link>
        ))}
      </aside>
      <main className="ml-64 flex-1 p-8"><Outlet /></main>
    </div>
  );
}
