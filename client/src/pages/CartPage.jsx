import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeFromCart, addToCart, itemCount } = useCart();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
              <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} alt={item.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-indigo-600 font-bold">${item.price?.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => item.qty > 1 ? addToCart(item.product, item.qty - 1) : removeFromCart(item.product)} className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"><MinusIcon className="w-3 h-3" /></button>
                    <span className="px-3 text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => addToCart(item.product, item.qty + 1)} className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"><PlusIcon className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product)} className="text-red-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          {subtotal < 50 && <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-3 mb-4">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>}
          <Link to="/checkout" className="block w-full text-center bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Proceed to Checkout</Link>
          <Link to="/products" className="block w-full text-center text-gray-600 mt-3 hover:text-indigo-600 transition-colors text-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
