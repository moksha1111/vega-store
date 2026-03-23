import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const currentMin = searchParams.get('minPrice') || '';
  const currentMax = searchParams.get('maxPrice') || '';

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    api.get(`/products?${params}`)
      .then(({ data }) => { setProducts(data.products); setTotal(data.total); setPages(data.pages); })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('keyword', keyword);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentCategory || 'All Products'}
          </h1>
          <p className="text-gray-500 mt-1">{total} products found</p>
        </div>

        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex">
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search..." className="border border-gray-300 rounded-l-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 w-48" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-xl hover:bg-indigo-700 transition-colors">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </form>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm hover:border-indigo-400 transition-colors">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select value={currentCategory} onChange={e => setParam('category', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
            <input type="number" value={currentMin} onChange={e => setParam('minPrice', e.target.value)} placeholder="$0" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
            <input type="number" value={currentMax} onChange={e => setParam('maxPrice', e.target.value)} placeholder="Any" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setParam('category', '')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!currentCategory ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setParam('category', c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentCategory === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
        ))}
      </div>

      {loading ? <Spinner /> : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setParam('page', p)} className={`w-10 h-10 rounded-xl font-semibold text-sm transition-colors ${currentPage === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
