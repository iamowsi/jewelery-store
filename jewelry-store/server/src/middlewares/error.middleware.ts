import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // خطای اعتبارسنجی ورودی‌ها (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: err.issues[0]?.message || 'اطلاعات ارسالی نامعتبر است',
    });
  }

  // خطای تکراری بودن فیلد Unique در Prisma (مثلاً ایمیل تکراری)
  if (err?.code === 'P2002') {
    return res.status(409).json({
      status: 'fail',
      message: 'این ایمیل قبلاً ثبت شده است',
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? 'خطای داخلی سرور رخ داد' : err.message;

  if (statusCode === 500) {
    console.error('Server Error:', err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  });
};