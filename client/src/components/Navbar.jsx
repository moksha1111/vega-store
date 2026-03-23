import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">VEGA</Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Shop</Link>
            <Link to="/products?category=Electronics" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Electronics</Link>
            <Link to="/products?category=Clothing" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Clothing</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{itemCount}</span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <UserIcon className="w-6 h-6" />
                  <span className="hidden sm:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50" onMouseLeave={() => setDropOpen(false)}>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50" onClick={() => setDropOpen(false)}>My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50" onClick={() => setDropOpen(false)}>My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50" onClick={() => setDropOpen(false)}>Admin Panel</Link>}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">Sign In</Link>
            )}

            {/* Mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/products" className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Shop All</Link>
          <Link to="/products?category=Electronics" className="block text-gray-700 py-2" onClick={() => setOpen(false)}>Electronics</Link>
          <Link to="/products?category=Clothing" className="block text-gray-700 py-2" onClick={() => setOpen(false)}>Clothing</Link>
          {user && <Link to="/orders" className="block text-gray-700 py-2" onClick={() => setOpen(false)}>My Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="block text-indigo-600 font-semibold py-2" onClick={() => setOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
}
