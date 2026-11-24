import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { invalidateProductsCache } from '../../utils/cache';

const createOrderSchema = z.object({
  fullName: z.string().min(2, 'نام و نام خانوادگی الزامی است'),
  phone: z.string().min(10, 'شماره تماس معتبر نیست'),
  address: z.string().min(10, 'آدرس کامل الزامی است'),
  postalCode: z.string().min(5, 'کد پستی معتبر نیست'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'سبد خرید خالی است'),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// ثبت سفارش جدید (کاربر لاگین‌شده) با تراکنش اتمی برای جلوگیری از تداخل موجودی
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    const order = await prisma.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalPrice = 0;

      const orderItemsData: {
        productId: string;
        quantity: number;
        unitPrice: number;
      }[] = [];

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new AppError('یکی از محصولات انتخابی یافت نشد', 404);
        }

        // کسر اتمی موجودی: فقط در صورتی که موجودی >= تعداد درخواستی باشد
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new AppError(`موجودی محصول "${product.title}" کافی نیست`, 400);
        }

        totalPrice += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      // ثبت نهایی سفارش (فعلاً با وضعیت PAID به عنوان شبیه‌سازی پرداخت موفق)
      return tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'PAID',
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          postalCode: data.postalCode,
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: { select: { title: true, imageUrl: true } } } },
        },
      });
    });

    // چون موجودی محصولات کم شده، کش محصولات تازه می‌شود
    await invalidateProductsCache();

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

// لیست سفارش‌های خود کاربر
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { title: true, imageUrl: true } } } },
      },
    });

    res.json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
};

// لیست تمام سفارش‌ها برای پنل ادمین
export const getAllOrders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { title: true, imageUrl: true } } } },
      },
    });

    res.json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
};

// تغییر وضعیت سفارش توسط ادمین
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { status } = updateStatusSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};