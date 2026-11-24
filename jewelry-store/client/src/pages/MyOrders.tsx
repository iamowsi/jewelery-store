import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { Order } from '../types';

const statusConfig: Record<Order['status'], { label: string; style: string }> = {
  PENDING: { label: 'در انتظار پرداخت', style: 'bg-stone-100 text-stone-700' },
  PAID: { label: 'پرداخت شده (در حال آماده‌سازی)', style: 'bg-amber-50 text-amber-800 border border-amber-200' },
  SHIPPED: { label: 'ارسال شده', style: 'bg-blue-50 text-blue-700 border border-blue-200' },
  DELIVERED: { label: 'تحویل داده شده', style: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  CANCELLED: { label: 'لغو شده', style: 'bg-red-50 text-red-700 border border-red-200' },
};

export default function MyOrders() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get('/orders/me')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">سفارش‌های من</h1>
        <Link to="/products" className="text-xs text-stone-600 hover:text-stone-900">
          بازگشت به فروشگاه
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500 py-12 text-center">در حال بارگذاری سفارش‌ها...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm text-stone-500">شما هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link
            to="/products"
            className="inline-block bg-stone-900 text-white text-xs px-6 py-2.5 rounded-full hover:bg-amber-800 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const st = statusConfig[order.status];
            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${st.style}`}>
                        {st.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">کد پیگیری: {order.id}</p>
                  </div>

                  <p className="text-sm font-semibold text-stone-900">
                    مبلغ کل: <span className="text-amber-800">{formatPrice(order.totalPrice)}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-[#FAF8F5] border border-stone-200/70 rounded-2xl p-3"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-stone-900 truncate">
                          {item.product.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {item.quantity} عدد × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-stone-500 pt-1">
                  ارسال به: {order.fullName} — {order.address} (کد پستی: {order.postalCode})
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}