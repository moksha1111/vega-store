import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StarIcon, ShoppingCartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try { await addToCart(product._id, qty); toast.success('Added to cart!'); }
    catch { toast.error('Failed to add to cart'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square mb-4">
            <img src={product.images?.[activeImg] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} alt={product.name} className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }} />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide mb-2">{product.category} {product.brand && `· ${product.brand}`}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex">
              {[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />)}
            </div>
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
            {product.originalPrice > product.price && <span className="text-xl text-gray-400 line-through">${product.originalPrice?.toFixed(2)}</span>}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-xl">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50 transition-colors rounded-l-xl"><MinusIcon className="w-4 h-4" /></button>
              <span className="px-4 py-3 font-semibold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-50 transition-colors rounded-r-xl"><PlusIcon className="w-4 h-4" /></button>
            </div>
            <span className="text-sm text-gray-500">{product.stock} in stock</span>
          </div>

          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold text-base hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ShoppingCartIcon className="w-5 h-5" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map(t => <span key={t} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {product.reviews?.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((r) => (
                  <div key={r._id} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-900">{r.name}</span>
                      <div className="flex">{[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} />)}</div>
                    </div>
                    <p className="text-gray-600 text-sm">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)}>
                        <StarIcon className={`w-8 h-8 transition-colors ${s <= reviewRating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} required placeholder="Share your experience..." rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
