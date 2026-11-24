import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './products.controller';
import { protect, adminOnly } from '../../middlewares/auth.middleware';

const router = Router();

// مسیرهای عمومی فروشگاه
router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/:slug', getProductBySlug);

// مسیرهای مدیریتی پنل ادمین
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;