"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_config2 = require("dotenv/config");

// src/app.ts
var import_express4 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_compression = __toESM(require("compression"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/modules/auth/auth.controller.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_zod2 = require("zod");

// src/config/prisma.ts
var import_config = require("dotenv/config");
var import_pg = require("pg");
var import_adapter_pg = require("@prisma/adapter-pg");
var import_client = require("@prisma/client");
var pool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 10
});
var adapter = new import_adapter_pg.PrismaPg(pool);
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new import_client.PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// src/middlewares/error.middleware.ts
var import_zod = require("zod");
var AppError = class extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
};
var errorHandler = (err, _req, res, _next) => {
  if (err instanceof import_zod.ZodError) {
    return res.status(400).json({
      status: "fail",
      message: err.issues[0]?.message || "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u0631\u0633\u0627\u0644\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A"
    });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({
      status: "fail",
      message: "\u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A"
    });
  }
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "\u062E\u0637\u0627\u06CC \u062F\u0627\u062E\u0644\u06CC \u0633\u0631\u0648\u0631 \u0631\u062E \u062F\u0627\u062F" : err.message;
  if (statusCode === 500) {
    console.error("Server Error:", err);
  }
  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message
  });
};

// src/modules/auth/auth.controller.ts
var signupSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "\u0646\u0627\u0645 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F2 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F"),
  email: import_zod2.z.string().email("\u0641\u0631\u0645\u062A \u0627\u06CC\u0645\u06CC\u0644 \u0635\u062D\u06CC\u062D \u0646\u06CC\u0633\u062A"),
  password: import_zod2.z.string().min(6, "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F6 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F")
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("\u0641\u0631\u0645\u062A \u0627\u06CC\u0645\u06CC\u0644 \u0635\u062D\u06CC\u062D \u0646\u06CC\u0633\u062A"),
  password: import_zod2.z.string().min(1, "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A")
});
var signToken = (userId, role) => {
  return import_jsonwebtoken.default.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};
var signup = async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const hashedPassword = await import_bcryptjs.default.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword
      },
      select: { id: true, name: true, email: true, role: true }
    });
    const token = signToken(user.id, user.role);
    res.status(201).json({ status: "success", token, user });
  } catch (err) {
    next(err);
  }
};
var login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });
    if (!user || !await import_bcryptjs.default.compare(data.password, user.password)) {
      return next(new AppError("\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A", 401));
    }
    const token = signToken(user.id, user.role);
    res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
var getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) return next(new AppError("\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F", 404));
    res.json({ status: "success", user });
  } catch (err) {
    next(err);
  }
};

// src/middlewares/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var protect = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u0648\u0627\u0631\u062F \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u062E\u0648\u062F \u0634\u0648\u06CC\u062F", 401));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken2.default.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch {
    next(new AppError("\u062A\u0648\u06A9\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A", 401));
  }
};
var adminOnly = (req, _res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError("\u0634\u0645\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u062F\u0645\u06CC\u0646 \u0646\u062F\u0627\u0631\u06CC\u062F", 403));
  }
  next();
};

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
var auth_routes_default = router;

// src/modules/products/products.routes.ts
var import_express2 = require("express");

// src/modules/products/products.controller.ts
var import_zod3 = require("zod");

// src/config/redis.ts
var import_ioredis = __toESM(require("ioredis"));
var redis = new import_ioredis.default(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 2e3);
  }
});
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// src/utils/cache.ts
var PRODUCTS_VERSION_KEY = "products:version";
var getProductsCacheVersion = async () => {
  try {
    const version = await redis.get(PRODUCTS_VERSION_KEY);
    return version || "1";
  } catch {
    return "1";
  }
};
var invalidateProductsCache = async () => {
  try {
    await redis.incr(PRODUCTS_VERSION_KEY);
  } catch {
  }
};
var getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};
var setCache = async (key, value, ttlSeconds = 300) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
  }
};

// src/modules/products/products.controller.ts
var productSchema = import_zod3.z.object({
  title: import_zod3.z.string().min(2, "\u0639\u0646\u0648\u0627\u0646 \u0645\u062D\u0635\u0648\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  slug: import_zod3.z.string().min(2, "\u0634\u0646\u0627\u0633\u0647 URL (slug) \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  description: import_zod3.z.string().min(5, "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0645\u062D\u0635\u0648\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  price: import_zod3.z.number().int().positive("\u0642\u06CC\u0645\u062A \u0628\u0627\u06CC\u062F \u0639\u062F\u062F \u0645\u062B\u0628\u062A \u0628\u0627\u0634\u062F"),
  stock: import_zod3.z.number().int().min(0, "\u0645\u0648\u062C\u0648\u062F\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u0646\u0641\u06CC \u0628\u0627\u0634\u062F"),
  category: import_zod3.z.string().min(2, "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  imageUrl: import_zod3.z.string().url("\u0622\u062F\u0631\u0633 \u062A\u0635\u0648\u06CC\u0631 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A"),
  isActive: import_zod3.z.boolean().optional()
});
var getProducts = async (req, res, next) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const version = await getProductsCacheVersion();
    const cacheKey = `products:v${version}:cat=${category}:q=${search}:sort=${sort}:p=${page}:l=${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const where = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    const orderBy = sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);
    const responsePayload = {
      status: "success",
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    await setCache(cacheKey, responsePayload, 300);
    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
};
var getProductBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug);
    const version = await getProductsCacheVersion();
    const cacheKey = `products:v${version}:slug=${slug}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product || !product.isActive) {
      return next(new AppError("\u0645\u062D\u0635\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F", 404));
    }
    const responsePayload = { status: "success", data: product };
    await setCache(cacheKey, responsePayload, 300);
    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
};
var getAdminProducts = async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: products });
  } catch (err) {
    next(err);
  }
};
var createProduct = async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    await invalidateProductsCache();
    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};
var updateProduct = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id },
      data
    });
    await invalidateProductsCache();
    res.json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};
var deleteProduct = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });
    await invalidateProductsCache();
    res.json({ status: "success", message: "\u0645\u062D\u0635\u0648\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
  } catch (err) {
    next(err);
  }
};

// src/modules/products/products.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/", getProducts);
router2.get("/admin/all", protect, adminOnly, getAdminProducts);
router2.get("/:slug", getProductBySlug);
router2.post("/", protect, adminOnly, createProduct);
router2.patch("/:id", protect, adminOnly, updateProduct);
router2.delete("/:id", protect, adminOnly, deleteProduct);
var products_routes_default = router2;

// src/modules/orders/orders.routes.ts
var import_express3 = require("express");

// src/modules/orders/orders.controller.ts
var import_zod4 = require("zod");
var createOrderSchema = import_zod4.z.object({
  fullName: import_zod4.z.string().min(2, "\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  phone: import_zod4.z.string().min(10, "\u0634\u0645\u0627\u0631\u0647 \u062A\u0645\u0627\u0633 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A"),
  address: import_zod4.z.string().min(10, "\u0622\u062F\u0631\u0633 \u06A9\u0627\u0645\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A"),
  postalCode: import_zod4.z.string().min(5, "\u06A9\u062F \u067E\u0633\u062A\u06CC \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A"),
  items: import_zod4.z.array(
    import_zod4.z.object({
      productId: import_zod4.z.string().min(1),
      quantity: import_zod4.z.number().int().positive()
    })
  ).min(1, "\u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u062E\u0627\u0644\u06CC \u0627\u0633\u062A")
});
var updateStatusSchema = import_zod4.z.object({
  status: import_zod4.z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
});
var createOrder = async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user.userId;
    const order = await prisma.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true }
      });
      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalPrice = 0;
      const orderItemsData = [];
      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new AppError("\u06CC\u06A9\u06CC \u0627\u0632 \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F", 404);
        }
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });
        if (updated.count === 0) {
          throw new AppError(`\u0645\u0648\u062C\u0648\u062F\u06CC \u0645\u062D\u0635\u0648\u0644 "${product.title}" \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A`, 400);
        }
        totalPrice += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price
        });
      }
      return tx.order.create({
        data: {
          userId,
          totalPrice,
          status: "PAID",
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          postalCode: data.postalCode,
          items: { create: orderItemsData }
        },
        include: {
          items: { include: { product: { select: { title: true, imageUrl: true } } } }
        }
      });
    });
    await invalidateProductsCache();
    res.status(201).json({ status: "success", data: order });
  } catch (err) {
    next(err);
  }
};
var getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { title: true, imageUrl: true } } } }
      }
    });
    res.json({ status: "success", data: orders });
  } catch (err) {
    next(err);
  }
};
var getAllOrders = async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { title: true, imageUrl: true } } } }
      }
    });
    res.json({ status: "success", data: orders });
  } catch (err) {
    next(err);
  }
};
var updateOrderStatus = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { status } = updateStatusSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.json({ status: "success", data: order });
  } catch (err) {
    next(err);
  }
};

// src/modules/orders/orders.routes.ts
var router3 = (0, import_express3.Router)();
router3.post("/", protect, createOrder);
router3.get("/me", protect, getMyOrders);
router3.get("/admin/all", protect, adminOnly, getAllOrders);
router3.patch("/:id/status", protect, adminOnly, updateOrderStatus);
var orders_routes_default = router3;

// src/app.ts
var app = (0, import_express4.default)();
app.use((0, import_helmet.default)());
app.use(
  (0, import_cors.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use((0, import_compression.default)());
app.use(import_express4.default.json({ limit: "10kb" }));
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  message: { status: "fail", message: "\u062A\u0639\u062F\u0627\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u0634\u0645\u0627 \u0632\u06CC\u0627\u062F \u0627\u0633\u062A\u060C \u06A9\u0645\u06CC \u0635\u0628\u0631 \u06A9\u0646\u06CC\u062F" }
});
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});
app.use("/api/auth", authLimiter, auth_routes_default);
app.use("/api/products", products_routes_default);
app.use("/api/orders", orders_routes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
var PORT = Number(process.env.PORT) || 5e3;
var server = app_default.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
var shutdown = async () => {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
