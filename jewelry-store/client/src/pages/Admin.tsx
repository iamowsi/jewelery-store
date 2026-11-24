import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, PlusCircle, Upload, X, Pencil } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { Order, Product } from '../types';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  price: '',
  stock: '10',
  category: 'necklace',
  imageUrl: '',
};

export default function Admin() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setMessage('');
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  };

  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setMessage('لطفاً ابتدا تصویر محصول را آپلود کنید');
      return;
    }

    setMessage('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
        setMessage('تغییرات محصول ذخیره شد و کش Redis بروزرسانی شد.');
        setEditingId(null);
      } else {
        await api.post('/products', payload);
        setMessage('محصول جدید اضافه شد و کش Redis بروزرسانی شد.');
      }
      setForm(emptyForm);
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'خطا در ذخیره محصول');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('این محصول حذف شود؟')) return;
    await api.delete(`/products/${id}`);
    if (editingId === id) handleCancelEdit();
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
          {/* فرم افزودن / ویرایش محصول */}
          <form
            onSubmit={handleSubmitProduct}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 h-fit"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-700" />
                    ویرایش محصول
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-amber-700" />
                    افزودن محصول جدید
                  </>
                )}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  انصراف
                </button>
              )}
            </div>

            {message && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl">{message}</p>
            )}

            {/* باکس آپلود مستقیم تصویر */}
            {form.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
                <img
                  src={form.imageUrl}
                  alt="پیش‌نمایش"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-2 left-2 bg-stone-900/80 text-white p-1 rounded-full hover:bg-red-600 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-2xl p-6 cursor-pointer hover:border-amber-700/60 hover:bg-stone-50 transition">
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="text-xs text-stone-600">
                  {uploading ? 'در حال آپلود تصویر...' : 'انتخاب عکس محصول از سیستم'}
                </span>
                <span className="text-[10px] text-stone-400">JPG, PNG, WEBP (حداکثر ۵ مگابایت)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}

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
              disabled={uploading}
              className="w-full bg-stone-900 text-white py-2.5 rounded-xl text-xs font-medium hover:bg-amber-800 disabled:bg-stone-400 transition cursor-pointer"
            >
              {editingId ? 'ذخیره تغییرات' : 'ثبت محصول'}
            </button>
          </form>

          {/* لیست محصولات */}
          <div className="lg:col-span-2 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition ${
                  editingId === p.id ? 'border-amber-600 ring-1 ring-amber-600/30' : 'border-stone-200'
                }`}
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(p)}
                    title="ویرایش محصول"
                    className="p-2 text-stone-400 hover:text-amber-700 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    title="حذف محصول"
                    className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* لیست سفارش‌ها */
        <div className="space-y-5">
          {orders.length === 0 ? (
            <p className="text-sm text-stone-500 bg-white p-8 rounded-2xl text-center border border-stone-200">
              هنوز سفارشی ثبت نشده است.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">{order.fullName}</span>
                      <span className="text-xs text-stone-400">|</span>
                      <span className="text-xs text-stone-600" dir="ltr">{order.phone}</span>
                      {order.user?.email && (
                        <>
                          <span className="text-xs text-stone-400">|</span>
                          <span className="text-xs text-stone-500" dir="ltr">{order.user.email}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">
                      آدرس: {order.address} — <span className="text-stone-500">کد پستی: {order.postalCode}</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      کد سفارش: {order.id} · تاریخ ثبت:{' '}
                      {new Date(order.createdAt).toLocaleString('fa-IR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-amber-800">
                      {formatPrice(order.totalPrice)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border border-stone-200 rounded-xl px-3 py-2 text-xs bg-stone-50 cursor-pointer"
                    >
                      <option value="PENDING">در انتظار پرداخت</option>
                      <option value="PAID">پرداخت شده</option>
                      <option value="SHIPPED">ارسال شده</option>
                      <option value="DELIVERED">تحویل داده شده</option>
                      <option value="CANCELLED">لغو شده</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-stone-500">
                    اقلام سفارش ({order.items.length} قلم):
                  </p>
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
                            تعداد: <strong className="text-stone-800">{item.quantity} عدد</strong> · قیمت واحد:{' '}
                            {formatPrice(item.unitPrice)}
                          </p>
                          <p className="text-[11px] font-medium text-amber-800 mt-0.5">
                            جمع: {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}