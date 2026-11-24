import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ShieldCheck, Package, Store } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to={isAdmin ? '/admin' : '/'}
          className="text-xl font-semibold tracking-wide text-stone-900"
        >
          نورا{' '}
          <span className="text-amber-700 font-light text-sm">
            | {isAdmin ? 'پنل مدیریت' : 'گالری زیورآلات'}
          </span>
        </Link>

        {/* منوی فروشگاه فقط برای مشتری‌ها */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition">صفحه اصلی</Link>
            <Link to="/products" className="hover:text-stone-900 transition">محصولات</Link>
            <Link to="/products?category=necklace" className="hover:text-stone-900 transition">گردنبند</Link>
            <Link to="/products?category=ring" className="hover:text-stone-900 transition">انگشتر</Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                مدیریت
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">مشاهده فروشگاه</span>
              </Link>
              <span className="hidden md:inline text-xs text-stone-400">|</span>
              <span className="hidden md:inline text-xs text-stone-600">{user.name}</span>
              <button
                onClick={handleLogout}
                title="خروج"
                className="p-2 text-stone-500 hover:text-red-600 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/checkout" className="relative p-2 text-stone-700 hover:text-stone-900 transition">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/orders"
                    title="سفارش‌های من"
                    className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-amber-800 transition"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">سفارش‌های من</span>
                  </Link>
                  <span className="hidden md:inline text-xs text-stone-400">|</span>
                  <span className="hidden md:inline text-xs text-stone-600">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    title="خروج"
                    className="p-2 text-stone-500 hover:text-red-600 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-stone-900 transition"
                >
                  <User className="w-4 h-4" />
                  <span>ورود</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}