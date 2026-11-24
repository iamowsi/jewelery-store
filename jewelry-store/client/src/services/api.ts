import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ارسال خودکار توکن JWT در هدر درخواست‌ها
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// فرمت‌دهی قیمت به تومان
export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fa-IR').format(price) + ' تومان';