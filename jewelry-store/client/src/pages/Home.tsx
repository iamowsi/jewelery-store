import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

const categories = [
  { key: 'necklace', label: 'گردنبند', desc: 'ظریف و روزمره' },
  { key: 'ring', label: 'انگشتر', desc: 'مینیمال و مدرن' },
  { key: 'earring', label: 'گوشواره', desc: 'سبک و شیک' },
  { key: 'bracelet', label: 'دستبند', desc: 'مناسب ست کردن' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products?limit=4')
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20">
      {/* بخش Hero */}
      <section className="bg-stone-900 text-[#FAF8F5] rounded-3xl px-8 py-20 md:py-28 text-center">
        <p className="text-xs tracking-widest text-amber-300/90 mb-4">کالکشن جدید ۱۴۰۵</p>
        <h1 className="text-3xl md:text-5xl font-semibold leading-tight max-w-2xl mx-auto">
          درخشش ساده، ماندگار در هر لحظه
        </h1>
        <p className="text-stone-300 text-sm md:text-base mt-5 max-w-lg mx-auto leading-relaxed">
          زیورآلات مینیمال با آبکاری طلای ۱۸ عیار و ضمانت رنگ ثابت برای استایل روزمره شما.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 bg-[#FAF8F5] text-stone-900 px-6 py-3 rounded-full text-sm font-medium hover:bg-amber-100 transition"
        >
          مشاهده همه محصولات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </section>

      {/* دسته‌بندی‌ها */}
      <section>
        <h2 className="text-xl font-semibold mb-6">دسته‌بندی‌ها</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/products?category=${cat.key}`}
              className="bg-white border border-stone-200/80 rounded-2xl p-6 hover:border-amber-700/50 transition group"
            >
              <h3 className="font-medium text-stone-900 group-hover:text-amber-800 transition">
                {cat.label}
              </h3>
              <p className="text-xs text-stone-500 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* جدیدترین محصولات */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">جدیدترین‌ها</h2>
          <Link
            to="/products"
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            همه محصولات <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">در حال بارگذاری...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}