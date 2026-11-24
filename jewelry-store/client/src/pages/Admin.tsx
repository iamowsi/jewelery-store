import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, PlusCircle } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { Order, Product } from '../types';

export default function Admin() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');

  // فرم افزودن محصول
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    stock: '10',
    category: 'necklace',
    imageUrl: '',
  });

  const loadData = () => {
    api.get('/products/admin/all').then((res) => setProducts(res.data.data));
    api.get('/orders/admin/all').then((res) => setOrders(res.data.data));
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData();
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setForm({
        title: '',
        slug: '',
        description: '',
        price: '',
        stock: '10',
        category: 'necklace',
        imageUrl: '',
      });
      setMessage('محصول جدید اضافه شد و کش Redis بروزرسانی شد.');
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'خطا در افزودن محصول');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('این محصول حذف شود؟')) return;
    await api.delete(`/products/${id}`);
    loadData();
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadData();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">پنل مدیریت فروشگاه</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-full text-xs cursor-pointer ${
              tab === 'products' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200'
            }`}
          >
            محصولات ({products.length})
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-full text-xs cursor-pointer ${
              tab === 'orders' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200'
            }`}
          >
            سفارش‌ها ({orders.length})
          </button>
        </div>
      </div>

      {tab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* فرم افزودن محصول */}
          <form
            onSubmit={handleAddProduct}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 h-fit"
          >
            <h2 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <PlusCircle className="w-4 h-4 text-amber-700" />
              افزودن محصول جدید
            </h2>
            {message && <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl">{message}</p>}

            <input
              required
              placeholder="عنوان محصول"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
            />
            <input
              required
              dir="ltr"
              placeholder="slug (مثلاً gold-ring-2)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs text-left"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                type="number"
                placeholder="قیمت (تومان)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
              />
              <input
                required
                type="number"
                placeholder="موجودی"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
            >
              <option value="necklace">گردنبند</option>
              <option value="ring">انگشتر</option>
              <option value="earring">گوشواره</option>
              <option value="bracelet">دستبند</option>
            </select>
            <input
              required
              dir="ltr"
              placeholder="لینک عکس محصول (https://...)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs text-left"
            />
            <textarea
              required
              rows={3}
              placeholder="توضیحات کوتاه محصول"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
            />

            <button
              type="submit"
              className="w-full bg-stone-900 text-white py-2.5 rounded-xl text-xs font-medium hover:bg-amber-800 transition cursor-pointer"
            >
              ثبت محصول
            </button>
          </form>

          {/* لیست محصولات */}
          <div className="lg:col-span-2 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-stone-500">
                      {formatPrice(p.price)} · موجودی: {p.stock}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* لیست سفارش‌ها */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-stone-500 bg-white p-8 rounded-2xl text-center border border-stone-200">
              هنوز سفارشی ثبت نشده است.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {order.fullName} — <span className="text-stone-500 font-normal">{order.phone}</span>
                  </p>
                  <p className="text-xs text-stone-500">{order.address}</p>
                  <p className="text-xs text-amber-800 font-medium">
                    مبلغ کل: {formatPrice(order.totalPrice)} ({order.items.length} قلم)
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50"
                >
                  <option value="PENDING">در انتظار پرداخت</option>
                  <option value="PAID">پرداخت شده</option>
                  <option value="SHIPPED">ارسال شده</option>
                  <option value="DELIVERED">تحویل داده شده</option>
                  <option value="CANCELLED">لغو شده</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}