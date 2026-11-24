import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';

const sampleProducts = [
  {
    title: 'گردنبند ظریف طلایی ماه و ستاره',
    slug: 'golden-moon-star-necklace',
    description: 'گردنبند استیل رنگ ثابت با آبکاری طلای ۱۸ عیار، طراحی مینیمال و مناسب استفاده روزمره و مهمانی.',
    price: 1450000,
    stock: 15,
    category: 'necklace',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'گردنبند مروارید طبیعی مینیمال',
    slug: 'minimal-pearl-necklace',
    description: 'زنجیر ظریف به همراه تک‌مروارید پرورشی با درخشش طبیعی و قفل ضدحساسیت.',
    price: 2100000,
    stock: 10,
    category: 'necklace',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'انگشتر سولیتر نگین زیرکونیا',
    slug: 'solitaire-zirconia-ring',
    description: 'انگشتر کلاسیک با رکاب باریک و نگین تراش‌خورده درخشان، بدون تغییر رنگ.',
    price: 980000,
    stock: 20,
    category: 'ring',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'ست انگشترهای مینیمال طلایی',
    slug: 'minimal-gold-ring-set',
    description: 'ست سه‌تایی انگشتر با طراحی ساده و مدرن، قابل استفاده به صورت تکی یا ترکیبی.',
    price: 1250000,
    stock: 12,
    category: 'ring',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'گوشواره حلقه‌ای ضخیم (Chunky Hoop)',
    slug: 'chunky-gold-hoop-earrings',
    description: 'گوشواره حلقه‌ای سبک و توخالی با قفل ایمن، انتخابی شیک برای استایل‌های روزمره.',
    price: 890000,
    stock: 25,
    category: 'earring',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'دستبند زنجیری کارتیه ظریف',
    slug: 'slim-cartier-chain-bracelet',
    description: 'دستبند زنجیری با بافت کلاسیک و آبکاری مقاوم در برابر آب، مناسب ست کردن با ساعت.',
    price: 1180000,
    stock: 18,
    category: 'bracelet',
    imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80',
  },
];

async function main() {
  console.log('در حال پر کردن دیتابیس...');

  // ۱. ساخت کاربر ادمین
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jewelry.com' },
    update: {},
    create: {
      name: 'مدیر فروشگاه',
      email: 'admin@jewelry.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`اکانت ادمین آماده شد: ${admin.email}`);

  // ۲. افزودن ۶ محصول نمونه
  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`${sampleProducts.length} محصول نمونه با موفقیت اضافه شد.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('خطا در اجرای Seed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });