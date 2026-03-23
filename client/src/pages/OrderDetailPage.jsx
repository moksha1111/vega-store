import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import Spinner from '../components/Spinner';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">{order._id}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${i <= stepIdx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                <span className={`text-xs capitalize font-medium ${i <= stepIdx ? 'text-indigo-600' : 'text-gray-400'}`}>{step}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`h-0.5 w-full mt-4 ${i < stepIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
          <address className="text-sm text-gray-600 not-italic space-y-1">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
            <p>{order.shippingAddress?.country}</p>
          </address>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Payment</h2>
          <p className="text-sm text-gray-600 capitalize">{order.paymentMethod}</p>
          <p className={`text-sm font-semibold mt-2 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>{order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not yet paid'}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Items</h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} alt={item.name} className="w-14 h-14 rounded-xl object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.qty} × ${item.price?.toFixed(2)}</p>
              </div>
              <p className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
          <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
        </div>
      </div>

      <Link to="/orders" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">← Back to Orders</Link>
    </div>
  );
}
