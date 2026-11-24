import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Sparkles, Truck, Check } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import type { Product } from '../types';

const categoryLabels: Record<string, string> = {
  necklace: 'گردنبند',
  ring: 'انگشتر',
  earring: 'گوشواره',
  bracelet: 'دستبند',
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    api
      .get(`/products/${slug}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-stone-500">
        در حال بارگذاری اطلاعات محصول...
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-stone-600 text-sm">محصول مورد نظر یافت نشد.</p>
        <Link
          to="/products"
          className="inline-block bg-stone-900 text-white text-xs px-6 py-2.5 rounded-full"
        >
          بازگشت به لیست محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به محصولات
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* تصویر محصول */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/70">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* اطلاعات و دکمه خرید */}
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <span className="inline-block text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full">
              {categoryLabels[product.category] || product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 leading-snug">
              {product.title}
            </h1>
          </div>

          <p className="text-2xl font-semibold text-stone-900">
            {formatPrice(product.price)}
          </p>

          <p className="text-sm text-stone-600 leading-8 border-y border-stone-200/80 py-5">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-stone-600">
              {product.stock > 0
                ? `موجود در انبار (${product.stock} عدد باقی‌مانده)`
                : 'در حال حاضر ناموجود است'}
            </span>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            className={`w-full sm:w-auto min-w-56 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 text-white hover:bg-amber-800 disabled:bg-stone-300'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                به سبد خرید اضافه شد
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {product.stock > 0 ? 'افزودن به سبد خرید' : 'ناموجود'}
              </>
            )}
          </button>

          {/* ویژگی‌های کوتاه فروشگاه */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="bg-white border border-stone-200/70 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>ضمانت رنگ ثابت</span>
            </div>
            <div className="bg-white border border-stone-200/70 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-stone-600">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>بسته‌بندی کادویی</span>
            </div>
            <div className="bg-white border border-stone-200/70 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-stone-600">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>ارسال سریع</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}