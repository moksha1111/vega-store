import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import useInView from '../hooks/useInView';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { name: 'Clothing', icon: '👗', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Books', icon: '📚', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
  { name: 'Home & Garden', icon: '🏡', img: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
  { name: 'Sports', icon: '⚽', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' },
];

let visitTracked = false;

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroRef, heroVisible] = useInView();
  const [featRef, featVisible] = useInView();
  const [catRef, catVisible] = useInView();

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => setFeatured(data)).finally(() => setLoading(false));
    if (!visitTracked) {
      visitTracked = true;
      api.post('/visitors/track').catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400" alt="" className="w-full h-full object-cover" />
        </div>
        <div ref={heroRef} className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 fade-up ${heroVisible ? 'visible' : ''}`}>
          <div className="max-w-2xl">
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">New Season Collection</p>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              Shop the <span className="text-yellow-400">Future</span> Today
            </h1>
            <p className="text-indigo-200 text-lg mb-10 leading-relaxed">Discover premium products curated for modern living. Quality, style, and value — all in one place.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-50 transition-colors">Shop Now</Link>
              <Link to="/products?featured=true" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-colors">View Featured</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10K+', 'Products'], ['50K+', 'Customers'], ['99%', 'Satisfaction'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold">{val}</div>
              <div className="text-indigo-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div ref={catRef} className={`fade-up ${catVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-500 mb-10">Find exactly what you're looking for</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={`/products?category=${cat.name}`}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-gray-100 hover:shadow-xl transition-all duration-300">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-white font-bold text-sm">{cat.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-20">
        <div ref={featRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-up ${featVisible ? 'visible' : ''}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-500">Our most popular picks this season</p>
            </div>
            <Link to="/products" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">View All →</Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-bold mb-2">Free Shipping on Orders $50+</h3>
            <p className="text-indigo-200">Use code VEGA20 for 20% off your first order</p>
          </div>
          <Link to="/products" className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap">Shop Now</Link>
        </div>
      </section>
    </div>
  );
}
