import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import {
  getCache,
  setCache,
  getProductsCacheVersion,
  invalidateProductsCache,
} from '../../utils/cache';

const productSchema = z.object({
  title: z.string().min(2, 'عنوان محصول الزامی است'),
  slug: z.string().min(2, 'شناسه URL (slug) الزامی است'),
  description: z.string().min(5, 'توضیحات محصول الزامی است'),
  price: z.number().int().positive('قیمت باید عدد مثبت باشد'),
  stock: z.number().int().min(0, 'موجودی نمی‌تواند منفی باشد'),
  category: z.string().min(2, 'دسته‌بندی الزامی است'),
  imageUrl: z.string().url('آدرس تصویر معتبر نیست'),
  isActive: z.boolean().optional(),
});

// دریافت لیست محصولات (عمومی - کش‌شده در Redis)
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'newest';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

    const version = await getProductsCacheVersion();
    const cacheKey = `products:v${version}:cat=${category}:q=${search}:sort=${sort}:p=${page}:l=${limit}`;

    // ۱. بررسی وجود پاسخ در Redis
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // ۲. اگر در کش نبود، خواندن از PostgreSQL
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any =
      sort === 'price_asc'
        ? { price: 'asc' }
        : sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const responsePayload = {
      status: 'success',
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // ۳. ذخیره در کش به مدت ۵ دقیقه (۳۰۰ ثانیه)
    await setCache(cacheKey, responsePayload, 300);

    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
};

// دریافت جزئیات یک محصول با slug (عمومی - کش‌شده در Redis)
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const version = await getProductsCacheVersion();
    const cacheKey = `products:v${version}:slug=${slug}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product || !product.isActive) {
      return next(new AppError('محصول یافت نشد', 404));
    }

    const responsePayload = { status: 'success', data: product };
    await setCache(cacheKey, responsePayload, 300);

    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
};

// دریافت همه محصولات برای پنل ادمین (بدون کش، شامل غیرفعال‌ها)
export const getAdminProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'success', data: products });
  } catch (err) {
    next(err);
  }
};

// افزودن محصول جدید (ادمین) + ابطال کش
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });

    await invalidateProductsCache();
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// ویرایش محصول (ادمین) + ابطال کش
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const data = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await invalidateProductsCache();
    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// حذف محصول (ادمین) + ابطال کش
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });

    await invalidateProductsCache();
    res.json({ status: 'success', message: 'محصول با موفقیت حذف شد' });
  } catch (err) {
    next(err);
  }
};