import 'dotenv/config';
import app from './app';
import { prisma } from './config/prisma';
import { redis } from './config/redis';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// خاموش شدن ایمن سرور بدون از دست رفتن درخواست‌های در حال اجرا
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);