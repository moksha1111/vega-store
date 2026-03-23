import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ street: '', city: '', state: '', zip: '', country: 'US' });
  const [paymentMethod, setPaymentMethod] = useState('card');

  const items = cart?.items || [];
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingPrice = itemsPrice > 50 ? 0 : 9.99;
  const taxPrice = itemsPrice * 0.08;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i.product, name: i.name, image: i.image, price: i.price, qty: i.qty })),
        shippingAddress: form,
        paymentMethod,
        itemsPrice: parseFloat(itemsPrice.toFixed(2)),
        shippingPrice: parseFloat(shippingPrice.toFixed(2)),
        taxPrice: parseFloat(taxPrice.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2))
      });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['street','Street Address','col-span-2'],['city','City',''],['state','State',''],['zip','ZIP Code',''],['country','Country','']].map(([field, label, cls]) => (
                <div key={field} className={cls}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <input required value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Method</h2>
            <div className="space-y-3">
              {[['card','💳 Credit / Debit Card'],['paypal','🅿️ PayPal'],['cod','📦 Cash on Delivery']].map(([val, label]) => (
                <label key={val} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === val ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}>
                  <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="text-indigo-600" />
                  <span className="font-medium text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-base hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Placing Order...' : `Place Order — $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {items.map(i => (
              <div key={i.product} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1">{i.name} × {i.qty}</span>
                <span className="font-medium ml-4">${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${itemsPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${taxPrice.toFixed(2)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
