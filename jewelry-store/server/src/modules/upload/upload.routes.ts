import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, adminOnly } from '../../middlewares/auth.middleware';
import { AppError } from '../../middlewares/error.middleware';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر ۵ مگابایت
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('فقط فرمت‌های تصویری (JPG, PNG, WEBP) مجاز هستند', 400));
    }
  },
});

router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('لطفاً یک تصویر انتخاب کنید', 400));
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(201).json({
      status: 'success',
      url: imageUrl,
    });
  }
);

export default router;