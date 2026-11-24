import { redis } from '../config/redis';

const PRODUCTS_VERSION_KEY = 'products:version';

export const getProductsCacheVersion = async (): Promise<string> => {
  try {
    const version = await redis.get(PRODUCTS_VERSION_KEY);
    return version || '1';
  } catch {
    return '1';
  }
};

export const invalidateProductsCache = async (): Promise<void> => {
  try {
    await redis.incr(PRODUCTS_VERSION_KEY);
  } catch {
    // در صورت قطعی موقت Redis، اجرای اصلی متوقف نشود
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // نادیده گرفتن خطای نوشتن کش
  }
};