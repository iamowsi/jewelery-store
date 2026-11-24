import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from './orders.controller';
import { protect, adminOnly } from '../../middlewares/auth.middleware';

const router = Router();

// مسیرهای کاربر لاگین‌شده
router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);

// مسیرهای پنل ادمین
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;