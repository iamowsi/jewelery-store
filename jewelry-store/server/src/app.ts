import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// تنظیمات امنیتی و بهینه‌سازی پاسخ‌ها
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' })); // جلوگیری از ارسال Payloadهای حجیم مخرب

// محدودیت نرخ درخواست فقط برای مسیرهای حساس احراز هویت
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ۱۵ دقیقه
  max: 30, // حداکثر ۳۰ تلاش در هر ۱۵ دقیقه برای هر IP
  message: { status: 'fail', message: 'تعداد درخواست‌های شما زیاد است، کمی صبر کنید' },
});

// مسیر تست سلامت سرور (Health Check)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// مسیرهای API
app.use('/api/auth', authLimiter, authRoutes);

// مدیریت خطاها
app.use(errorHandler);

export default app;