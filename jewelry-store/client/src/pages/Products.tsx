import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

const categoryTabs = [
  { key: '', label: 'همه' },
  { key: 'necklace', label: 'گردنبند' },
  { key: 'ring', label: 'انگشتر' },
  { key: 'earring', label: 'گوشواره' },
  { key: 'bracelet', label: 'دستبند' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search.trim()) params.set('search', search.trim());
    params.set('sort', sort);

    const timer = setTimeout(() => {
      api
        .get(`/products?${params.toString()}`)
        .then((res) => setProducts(res.data.data))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [activeCategory, search, sort]);

  const handleCategoryChange = (key: string) => {
    if (key) setSearchParams({ category: key });
    else setSearchParams({});
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">محصولات گالری</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی زیورآلات..."
              className="bg-white border border-stone-200 rounded-full pr-9 pl-4 py-2 text-xs focus:outline-none focus:border-stone-500 w-56"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-stone-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-stone-500"
          >
            <option value="newest">جدیدترین</option>
            <option value="price_asc">ارزان‌ترین</option>
            <option value="price_desc">گران‌ترین</option>
          </select>
        </div>
      </div>

      {/* فیلتر دسته‌بندی */}
      <div className="flex flex-wrap gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
              activeCategory === tab.key
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* لیست محصولات */}
      {loading ? (
        <p className="text-sm text-stone-500 py-10 text-center">در حال بارگذاری محصولات...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-stone-500 py-16 text-center bg-white rounded-2xl border border-stone-200">
          محصولی با این مشخصات یافت نشد.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}