import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Checkout() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const handleOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/orders', {
        fullName,
        phone,
        address,
        postalCode,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      setOrderId(res.data.data.id);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h1 className="text-xl font-semibold">سفارش شما با موفقیت ثبت شد</h1>
        <p className="text-xs text-stone-500">کد پیگیری سفارش: {orderId}</p>
        <Link
          to="/products"
          className="inline-block bg-stone-900 text-white text-xs px-6 py-2.5 rounded-full hover:bg-amber-800 transition"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-stone-500 text-sm">سبد خرید شما خالی است.</p>
        <Link
          to="/products"
          className="inline-block bg-stone-900 text-white text-xs px-6 py-2.5 rounded-full"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* لیست کالاهای سبد خرید */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-xl font-semibold mb-4">سبد خرید شما</h1>
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4"
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-20 h-20 rounded-xl object-cover bg-stone-100"
            />
            <div className="flex-1">
              <h3 className="text-sm font-medium">{product.title}</h3>
              <p className="text-xs text-stone-500 mt-1">{formatPrice(product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm w-6 text-center">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => removeItem(product.id)}
              className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* فرم ارسال و پرداخت */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 h-fit space-y-5">
        <h2 className="text-lg font-semibold">تکمیل سفارش و پرداخت</h2>

        <div className="flex items-center justify-between text-sm py-3 border-y border-stone-100">
          <span className="text-stone-600">مبلغ قابل پرداخت:</span>
          <span className="font-semibold text-base">{formatPrice(totalPrice())}</span>
        </div>

        {!user ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-xs text-stone-500">برای ثبت نهایی سفارش ابتدا وارد حساب شوید.</p>
            <Link
              to="/auth"
              className="block w-full bg-stone-900 text-white py-2.5 rounded-xl text-xs"
            >
              ورود / ثبت‌نام
            </Link>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-3">
            {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">{error}</p>}

            <input
              type="text"
              required
              placeholder="نام و نام خانوادگی تحویل‌گیرنده"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-stone-800"
            />
            <input
              type="tel"
              required
              placeholder="شماره تماس (مثلاً 09123456789)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-stone-800"
            />
            <input
              type="text"
              required
              placeholder="کد پستی"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-stone-800"
            />
            <textarea
              required
              rows={3}
              placeholder="آدرس دقیق پستی"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-stone-800"
            />

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-800 disabled:bg-stone-400 transition cursor-pointer"
            >
              {loading ? 'در حال ثبت...' : 'پرداخت و ثبت نهایی سفارش'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}