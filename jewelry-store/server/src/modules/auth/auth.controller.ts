import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';

const signupSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('فرمت ایمیل صحیح نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const loginSchema = z.object({
  email: z.string().email('فرمت ایمیل صحیح نیست'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

const signToken = (userId: string, role: 'CUSTOMER' | 'ADMIN') => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signToken(user.id, user.role);

    res.status(201).json({ status: 'success', token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return next(new AppError('ایمیل یا رمز عبور اشتباه است', 401));
    }

    const token = signToken(user.id, user.role);

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return next(new AppError('کاربر یافت نشد', 404));

    res.json({ status: 'success', user });
  } catch (err) {
    next(err);
  }
};