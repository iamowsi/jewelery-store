import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await api.post(endpoint, payload);

      setAuth(res.data.user, res.data.token);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطایی رخ داد، دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border border-stone-200 rounded-3xl p-8">
      <h1 className="text-xl font-semibold text-center mb-2">
        {isLogin ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری'}
      </h1>
      <p className="text-xs text-stone-500 text-center mb-6">
        {isLogin ? 'خوش برگشتید! اطلاعات خود را وارد کنید' : 'برای ثبت سفارش عضو گالری نورا شوید'}
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs text-stone-600 mb-1.5">نام و نام خانوادگی</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-stone-600 mb-1.5">ایمیل</label>
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800 text-left"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1.5">رمز عبور</label>
          <input
            type="password"
            required
            minLength={6}
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800 text-left"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-800 disabled:bg-stone-400 transition cursor-pointer"
        >
          {loading ? 'لطفاً صبر کنید...' : isLogin ? 'ورود' : 'ثبت‌نام'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-stone-500">
        {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-amber-800 font-medium hover:underline cursor-pointer"
        >
          {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
        </button>
      </div>
    </div>
  );
}