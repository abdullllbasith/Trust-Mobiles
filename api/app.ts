import '../config/env.js';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import {
  env,
  assertVercelEnv,
  getMissingVercelEnvVars,
  resolveAIProvider,
  resolveAIModel,
  resolveChatModelChain,
  isEmbeddingModel,
  type AIProvider,
} from '../config/env.js';

/** OpenAI-compatible client for OpenRouter or NVIDIA NIM. */
let aiClient: OpenAI | null = null;
let aiProvider: AIProvider | null = null;

function getAIClient(): { client: OpenAI; provider: AIProvider; model: string } | null {
  const provider = resolveAIProvider();
  if (!provider) return null;

  if (!aiClient || aiProvider !== provider) {
    aiProvider = provider;
    if (provider === 'openrouter') {
      aiClient = new OpenAI({
        apiKey: env.OPENROUTER_API_KEY!,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': env.APP_URL,
          'X-Title': 'Trust Mobile',
        },
      });
    } else {
      aiClient = new OpenAI({
        apiKey: env.NVIDIA_API_KEY!,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
    }
  }

  return {
    client: aiClient,
    provider,
    model: resolveAIModel(provider),
  };
}

const app = express();

function getJwtSecret(): string {
  if (env.JWT_SECRET) return env.JWT_SECRET;
  if (env.isProduction) {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'dev-only-trust-mobile-jwt';
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser / same-origin requests
    if (!origin) return callback(null, true);
    if (!env.isProduction) return callback(null, true);

    const allowed = new Set(
      [
        env.APP_URL,
        'https://trust-mobiles.vercel.app',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
      ].filter(Boolean),
    );

    if (allowed.has(origin) || /\.vercel\.app$/i.test(new URL(origin).hostname)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

function clientKey(req: express.Request) {
  return `${req.ip || 'unknown'}:${String(req.body?.email || '').toLowerCase()}`;
}

function isLoginLocked(key: string) {
  const row = loginAttempts.get(key);
  if (!row) return false;
  if (Date.now() > row.lockedUntil && row.count >= LOGIN_MAX_ATTEMPTS) {
    loginAttempts.delete(key);
    return false;
  }
  return Date.now() < row.lockedUntil && row.count >= LOGIN_MAX_ATTEMPTS;
}

function recordFailedLogin(key: string) {
  const row = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  row.count += 1;
  if (row.count >= LOGIN_MAX_ATTEMPTS) {
    row.lockedUntil = Date.now() + LOGIN_WINDOW_MS;
  }
  loginAttempts.set(key, row);
}

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [String],
  specs: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Overwrite toJSON to ensure id is available on the client
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [mongoose.Schema.Types.Mixed],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'processing' },
  channel: { type: String, default: 'whatsapp' },
  address: mongoose.Schema.Types.Mixed
}, { timestamps: true });

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  endDate: { type: Date },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  position: { type: String, default: 'carousel' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

adSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  categories: [String]
}, { timestamps: true });

brandSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});


const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Advertisement = mongoose.model('Advertisement', adSchema);
const Category = mongoose.model('Category', categorySchema);
const Brand = mongoose.model('Brand', brandSchema);

// Seed Database
const seedData = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    const password = env.ADMIN_PASSWORD;
    if (!password) {
      console.warn('No admin user seeded. Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) to create the first admin.');
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        name: 'Admin',
        email: env.ADMIN_EMAIL.toLowerCase(),
        password: hash,
        role: 'admin',
      });
      console.log(`Seeded admin account for ${env.ADMIN_EMAIL}`);
    }
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: "Google Pixel 8 Pro", brand: "Google", category: "Phones", price: 999, discount: 10, stock: 50,
        images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "12GB", storage: "256GB", processor: "Google Tensor G3" }
      },
      {
        name: "Samsung Galaxy S24", brand: "Samsung", category: "Phones", price: 1199, discount: 5, stock: 30,
        images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "8GB", storage: "256GB", processor: "Exynos 2400" }
      },
      {
        name: "iPhone 15 Pro", brand: "Apple", category: "Phones", price: 1099, discount: 0, stock: 20,
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "8GB", storage: "256GB", processor: "A17 Pro" }
      },
      {
        name: "AirPods Pro", brand: "Apple", category: "Accessories", price: 249, discount: 15, stock: 100,
        images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800"],
        specs: { type: "Earbuds", anc: "Yes" }
      }
    ]);
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.insertMany([
      { name: "Phones" },
      { name: "Tablets" },
      { name: "Accessories" },
      { name: "Audio" }
    ]);
  }

  const brandCount = await Brand.countDocuments();
  if (brandCount === 0) {
    await Brand.insertMany([
      { name: "Apple", categories: ["Phones", "Tablets", "Accessories", "Audio"] },
      { name: "Samsung", categories: ["Phones", "Tablets", "Accessories"] },
      { name: "Google", categories: ["Phones", "Accessories"] },
      { name: "JBL", categories: ["Audio"] },
      { name: "Sony", categories: ["Phones", "Audio"] }
    ]);
  }
};

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in again.' });
  }

  jwt.verify(token, getJwtSecret(), (err: any, user: any) => {
    if (err) {
      const expired = err?.name === 'TokenExpiredError';
      return res.status(401).json({
        error: expired
          ? 'Your session has expired. Please log in again.'
          : 'Invalid session. Please log in again.',
      });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin' || req.user.typ !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for this action.' });
  }
  next();
};

const authenticateAdmin = [authenticateToken, isAdmin];

function mongoErrorMessage(error: any, fallback: string) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'value';
    return `A record with this ${field} already exists.`;
  }
  if (error?.name === 'ValidationError') {
    const first = Object.values(error.errors || {})[0] as any;
    return first?.message || 'Validation failed';
  }
  return fallback;
}

// Database connection singleton (safe for Vercel serverless cold starts)
type MongoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __trustMobileMongo: MongoCache | undefined;
}

const mongoCache: MongoCache = global.__trustMobileMongo || { conn: null, promise: null };
global.__trustMobileMongo = mongoCache;

export const connectDB = async () => {
  if (mongoCache.conn && mongoose.connection.readyState === 1) {
    return;
  }

  if (env.isVercel) {
    assertVercelEnv();
  }

  let mongoUri = env.MONGODB_URI;

  if (!mongoUri) {
    if (env.isVercel) {
      throw new Error(
        'CRITICAL: MONGODB_URI environment variable is missing in Vercel. Please add it to your Vercel project settings.',
      );
    }
    console.log('No MONGODB_URI provided, starting in-memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }

  if (!mongoCache.promise) {
    mongoCache.promise = mongoose
      .connect(mongoUri, {
        // Force IPv4 — Vercel + Atlas SRV often hangs on broken IPv6 routes.
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        maxPoolSize: 5,
        family: 4,
        bufferCommands: false,
      })
      .then(async (conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        await seedData();
        console.log('Database ready');
        return conn;
      })
      .catch((error) => {
        mongoCache.promise = null;
        mongoCache.conn = null;
        console.error('Failed to connect to MongoDB:', error?.message || error);
        throw error;
      });
  }

  mongoCache.conn = await mongoCache.promise;
};

// Health check (useful for verifying Vercel env + DB connectivity)
app.get('/api/health', async (_req, res) => {
  const missingEnv = getMissingVercelEnvVars();
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  let dbError: string | undefined;

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (error: any) {
    dbStatus = 'error';
    dbError = String(error?.message || error);
  }

  res.status(missingEnv.length > 0 || dbStatus === 'error' ? 503 : 200).json({
    ok: missingEnv.length === 0 && dbStatus === 'connected',
    environment: env.isVercel ? 'vercel' : 'local',
    database: dbStatus,
    dbError,
    missingEnv,
    hint:
      dbStatus === 'error'
        ? 'MongoDB Atlas is blocking Vercel. Open Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0), wait ~1 minute, then reload the shop.'
        : undefined,
    services: {
      ai: true,
      provider: resolveAIProvider() ?? 'local',
      model: resolveAIProvider() ? env.AI_MODEL : 'inventory-assistant',
      fallbacks: resolveAIProvider()
        ? env.AI_FALLBACK_MODELS
        : [],
      chatModelChain: resolveAIProvider()
        ? resolveChatModelChain(resolveAIProvider()!)
        : ['inventory-assistant'],
      skippedFallbacks: env.AI_FALLBACK_MODELS.filter((m) => isEmbeddingModel(m)),
    },
    appUrl: env.APP_URL,
  });
});

// --- API ROUTES ---

// Serverless DB connection middleware
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('API Middleware DB Error:', error);
    res.status(503).json({
      error:
        'Database connection failed. If env vars are set, open MongoDB Atlas → Network Access and allow 0.0.0.0/0 so Vercel can connect.',
      detail: String(error?.message || error),
    });
  }
});

// Public customer registration/login disabled — shop is guest checkout only.
app.post('/api/auth/register', (_req, res) => {
  res.status(403).json({ error: 'Customer accounts are disabled. Checkout via WhatsApp instead.' });
});

app.post('/api/auth/login', (_req, res) => {
  res.status(403).json({ error: 'Use /admin/login for staff access.' });
});

app.post('/api/admin/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const key = clientKey(req);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isLoginLocked(key)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      recordFailedLogin(key);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password as string);
    if (!ok) {
      recordFailedLogin(key);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    loginAttempts.delete(key);

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        typ: 'admin',
      },
      getJwtSecret(),
      { expiresIn: '8h' },
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Invalid product ID' });
  }
});

app.post('/api/products', ...authenticateAdmin, async (req, res) => {
  const { name, brand, category, price, discount, stock, images, specs } = req.body;

  try {
    if (!String(name || '').trim() || !String(brand || '').trim() || !String(category || '').trim()) {
      return res.status(400).json({ error: 'Name, brand, and category are required' });
    }
    if (price === undefined || price === null || price === '' || Number.isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'A valid price is required' });
    }
    const newProd = await Product.create({
      name: String(name).trim(),
      brand: String(brand).trim(),
      category: String(category).trim(),
      price: parseFloat(price),
      discount: parseFloat(discount || 0),
      stock: parseInt(stock || 0, 10),
      images: Array.isArray(images) ? images : [],
      specs: specs || {},
    });
    res.status(201).json({ id: newProd._id, success: true });
  } catch (error) {
    res.status(500).json({ error: mongoErrorMessage(error, 'Failed to create product') });
  }
});

app.delete('/api/products/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const { name, brand, category, price, discount, stock, images, specs } = req.body;
    if (!String(name || '').trim() || !String(brand || '').trim() || !String(category || '').trim()) {
      return res.status(400).json({ error: 'Name, brand, and category are required' });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, {
      name: String(name).trim(),
      brand: String(brand).trim(),
      category: String(category).trim(),
      price: parseFloat(price),
      discount: parseFloat(discount || 0),
      stock: parseInt(stock || 0, 10),
      images: Array.isArray(images) ? images : [],
      specs: specs || {},
    }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: mongoErrorMessage(error, 'Failed to update product') });
  }
});

// Orders — guest WhatsApp checkout (no login)
app.post('/api/orders', async (req, res) => {
  const { items, totalPrice, address, channel } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }
  if (totalPrice === undefined || Number.isNaN(Number(totalPrice))) {
    return res.status(400).json({ error: 'A valid total is required' });
  }
  if (!address?.firstName || !address?.lastName || !address?.phone || !address?.address || !address?.city) {
    return res.status(400).json({ error: 'Delivery name, phone, address, and city are required' });
  }

  try {
    const newOrder = await Order.create({
      items,
      totalPrice: Number(totalPrice),
      paymentStatus: 'pending',
      orderStatus: 'processing',
      channel: channel === 'whatsapp' ? 'whatsapp' : 'whatsapp',
      address: {
        firstName: String(address.firstName).trim(),
        lastName: String(address.lastName).trim(),
        phone: String(address.phone).trim(),
        email: address.email ? String(address.email).trim() : '',
        address: String(address.address).trim(),
        city: String(address.city).trim(),
        note: address.note ? String(address.note).trim() : '',
      },
    });
    res.status(201).json({ id: newOrder._id, success: true });
  } catch {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', ...authenticateAdmin, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, {
      orderStatus, paymentStatus
    }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Users
app.get('/api/users', ...authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, {
      name, email, role
    }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', ...authenticateAdmin, async (req: any, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'admin') {
      return res.status(400).json({ error: 'Admin users cannot be deleted.' });
    }
    if (String(target._id) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Advertisements
app.get('/api/ads', async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

app.post('/api/ads', ...authenticateAdmin, async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const image = String(req.body?.image || '').trim();
    if (!title) return res.status(400).json({ error: 'Ad title is required' });
    if (!image) return res.status(400).json({ error: 'Ad image is required' });
    const ad = await Advertisement.create({
      title,
      description: String(req.body?.description || ''),
      endDate: req.body?.endDate || undefined,
      image,
      link: String(req.body?.link || ''),
      position: String(req.body?.position || 'carousel'),
      active: req.body?.active !== false,
    });
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: mongoErrorMessage(error, 'Failed to create ad') });
  }
});

app.put('/api/ads/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const update: Record<string, unknown> = { ...req.body };
    if (update.title !== undefined) update.title = String(update.title).trim();
    if (update.image !== undefined) update.image = String(update.image).trim();
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: mongoErrorMessage(error, 'Failed to update ad') });
  }
});

app.delete('/api/ads/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const deletedAd = await Advertisement.findByIdAndDelete(req.params.id);
    if (!deletedAd) return res.status(404).json({ error: 'Ad not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', ...authenticateAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: mongoErrorMessage(error, 'Failed to create category') });
  }
});

app.delete('/api/categories/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

app.post('/api/brands', ...authenticateAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const categories = Array.isArray(req.body?.categories)
      ? req.body.categories.map((c: any) => String(c).trim()).filter(Boolean)
      : [];
    if (!name) return res.status(400).json({ error: 'Brand name is required' });
    if (categories.length === 0) {
      return res.status(400).json({ error: 'Select at least one category for this brand' });
    }
    const brand = await Brand.create({ name, categories });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ error: mongoErrorMessage(error, 'Failed to create brand') });
  }
});

app.put('/api/brands/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const update: Record<string, unknown> = {};
    if (req.body?.name !== undefined) update.name = String(req.body.name).trim();
    if (req.body?.categories !== undefined) {
      update.categories = Array.isArray(req.body.categories)
        ? req.body.categories.map((c: any) => String(c).trim()).filter(Boolean)
        : [];
    }
    const brand = await Brand.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: mongoErrorMessage(error, 'Failed to update brand') });
  }
});

app.delete('/api/brands/:id', ...authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Brand not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

function normalizeChatMessage(message: any): { role: string; content: string } {
  let content = message?.content;
  if (Array.isArray(content)) {
    content = content
      .map((part: any) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('')
      .trim();
  }
  if (!content || typeof content !== 'string') {
    content =
      message?.reasoning ||
      message?.reasoning_content ||
      'Sorry, I could not generate a response right now. Please try again.';
  }
  return {
    role: message?.role || 'assistant',
    content: structureChatReply(String(content).trim()),
  };
}

function formatProductListMarkdown(products: any[], title: string) {
  if (!products.length) {
    return `${title}\n\nNo products available right now.`;
  }

  const items = products
    .map((p: any, index: number) => {
      const specs = p.specs && typeof p.specs === 'object'
        ? Object.entries(p.specs)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' • ')
        : '';
      const lines = [
        `${index + 1}. **${p.name}**`,
        `   - Price: LKR ${p.price}${p.discount ? ` (${p.discount}% off)` : ''}`,
        `   - Stock: ${p.stock}`,
      ];
      if (specs) lines.push(`   - Specs: ${specs}`);
      return lines.join('\n');
    })
    .join('\n\n');

  return `${title}\n\n${items}`;
}

async function searchProductsForChat(query: string) {
  if (isBrowseInventoryQuery(query)) {
    const availableProducts = await Product.find({ stock: { $gt: 0 } }).limit(12).lean();
    return {
      action: null,
      toolContent: JSON.stringify({
        status: 'catalog',
        message: `User asked for a general catalog list. Do NOT open a product page. List these in-stock items in structured markdown (numbered list, each field on its own line):\n${availableProducts.map((p: any) => `${p.name}|${p.brand}|LKR ${p.price}|stock ${p.stock}`).join('\n')}`,
      }),
    };
  }

  const foundProducts = await findProductsForQuery(query);

  if (foundProducts.length > 0) {
    const matchedProduct = foundProducts[0] as any;
    const navigate = shouldNavigateToProduct(query, matchedProduct);
    return {
      action: navigate ? { type: 'navigate' as const, url: `/product/${matchedProduct._id}` } : null,
      toolContent: JSON.stringify({
        status: 'found',
        message: navigate
          ? `Product found: ${matchedProduct.name} by ${matchedProduct.brand}. Price: LKR ${matchedProduct.price}. Tell the user we have it in stock and that you are automatically navigating them to the product page right now.`
          : `Possible matches found (do NOT auto-open a page unless the user named one specifically): ${foundProducts.map((p: any) => p.name).join(', ')}. Present them as a structured markdown list.`,
      }),
    };
  }

  const availableProducts = await Product.find({ stock: { $gt: 0 } }).limit(3);
  return {
    action: null,
    toolContent: JSON.stringify({
      status: 'not_found',
      message: `Product '${query}' not found in database. Here are some available alternatives to suggest to the user: ${availableProducts.map((p) => p.name).join(', ')}.`,
    }),
  };
}

async function localShoppingAssistant(messages: any[]) {
  const lastUser = [...(messages || [])].reverse().find((m) => m.role === 'user');
  const text = String(lastUser?.content || '').trim();
  const lower = text.toLowerCase();

  if (!text || /^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo)\b/.test(lower)) {
    return {
      message: {
        role: 'assistant',
        content:
          "Hi! I'm your Trust Mobile shopping assistant. Ask me about phones, brands, prices, or stock — for example: \"Do you have iPhone 15?\" or \"Show Samsung phones\".",
      },
      action: null,
    };
  }

  if (isBrowseInventoryQuery(text)) {
    const phones = await Product.find({
      stock: { $gt: 0 },
      category: { $regex: /phone/i },
    })
      .limit(12)
      .lean();
    const list = phones.length
      ? phones
      : await Product.find({ stock: { $gt: 0 } }).limit(12).lean();

    return {
      message: {
        role: 'assistant',
        content: formatProductListMarkdown(
          list,
          'Here are the phones currently in stock at Trust Mobile:',
        ),
      },
      action: null,
    };
  }

  const found = await findProductsForQuery(text);

  if (found.length > 0) {
    const top = found[0] as any;
    const navigate = shouldNavigateToProduct(text, top);
    const list = found
      .map((p: any, index: number) =>
        `${index + 1}. **${p.name}** (${p.brand})\n   - Price: LKR ${p.price}${p.stock > 0 ? '' : '\n   - Stock: out of stock'}`,
      )
      .join('\n\n');

    return {
      message: {
        role: 'assistant',
        content: navigate
          ? `Yes — **${top.name}** is available:\n\n- Price: LKR ${top.price}\n- Stock: ${top.stock}\n\nOpening the product page for you now.`
          : `I found ${found.length} match${found.length > 1 ? 'es' : ''} in our store:\n\n${list}`,
      },
      action: navigate ? { type: 'navigate' as const, url: `/product/${top._id}` } : null,
    };
  }

  const alternatives = await Product.find({ stock: { $gt: 0 } }).limit(4).lean();
  return {
    message: {
      role: 'assistant',
      content: formatProductListMarkdown(
        alternatives,
        `I couldn't find exact matches for "${text}". Here are some popular items in stock:`,
      ) + '\n\nTry asking with a brand or model name.',
    },
    action: null,
  };
}

function buildChatRequest(model: string, provider: AIProvider, messages: any[], withTools: boolean, tools?: any[]) {
  const body: any = {
    model,
    messages,
    max_tokens: 800,
    temperature: 0.6,
  };

  if (withTools && tools) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  // Disable long "thinking" traces for shopping chat (NVIDIA NIM)
  if (provider === 'nvidia') {
    body.chat_template_kwargs = { enable_thinking: false };
    body.reasoning_effort = 'none';
  }

  return body;
}

function formatAIError(error: any): string {
  const status = error?.status;
  const msg = String(error?.message || error || '');

  if (status === 401 || msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
    return 'AI API key is invalid. Check OPENROUTER_API_KEY or NVIDIA_API_KEY in .env';
  }
  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('rate')) {
    return 'AI rate limit reached. Please try again in a moment.';
  }
  if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('credit')) {
    return 'AI credits/quota exhausted. Add a new OpenRouter or NVIDIA API key.';
  }
  return msg.slice(0, 200) || 'Failed to communicate with AI';
}

function isRetryableModelError(error: any): boolean {
  const status = error?.status;
  const msg = String(error?.message || error || '').toLowerCase();
  return (
    status === 429 ||
    status === 408 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('rate') ||
    msg.includes('timeout') ||
    msg.includes('overloaded') ||
    msg.includes('temporarily') ||
    msg.includes('no endpoints') ||
    msg.includes('model not found') ||
    msg.includes('not supported')
  );
}

/** Try each chat model in order until one succeeds (used for OpenRouter free-tier fallbacks). */
async function createCompletionWithFallback(options: {
  client: OpenAI;
  provider: AIProvider;
  models: string[];
  messages: any[];
  withTools: boolean;
  tools?: any[];
}) {
  const { client, provider, models, messages, withTools, tools } = options;
  let lastError: any = null;

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    try {
      const completion = await client.chat.completions.create(
        buildChatRequest(model, provider, messages, withTools, withTools ? tools : undefined),
      );
      if (i > 0) {
        console.warn(`[AI] Fell back to model: ${model}`);
      }
      return { completion, model };
    } catch (error: any) {
      lastError = error;
      const canRetry = isRetryableModelError(error) && i < models.length - 1;
      console.warn(
        `[AI] Model failed (${model}): ${error?.message || error}` +
          (canRetry ? ' — trying next fallback…' : ''),
      );
      if (!canRetry) break;
    }
  }

  throw lastError || new Error('All AI models failed');
}

function isGreeting(text: string) {
  return /^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|thanks|thank you|ok|okay)\b/i.test(text.trim());
}

const SEARCH_STOPWORDS = new Set([
  'do', 'you', 'have', 'got', 'looking', 'for', 'show', 'me', 'find', 'search', 'any',
  'the', 'a', 'an', 'please', 'want', 'need', 'available', 'in', 'stock', 'price', 'of',
  'how', 'much', 'is', 'are', 'there', 'your', 'store', 'i', 'asked', 'ask', 'about',
  'open', 'page', 'product', 'can', 'get', 'buy', 'with', 'and', 'or', 'to', 'my',
  'this', 'that', 'what', 'which', 'one', 'some', 'under', 'over', 'lkr', 'rs',
  'all', 'list', 'tell', 'currently', 'options', 'option', 'sell', 'selling',
]);

/** Broad category words — matching only these should never auto-open a product page */
const CATEGORY_SEARCH_TOKENS = new Set([
  'phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'smartphones',
  'accessory', 'accessories', 'tablet', 'tablets', 'device', 'devices',
  'product', 'products', 'item', 'items', 'inventory', 'catalog', 'model', 'models',
]);

function isBrowseInventoryQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (!lower) return false;

  const browsePatterns = [
    /\bwhat\s+(are\s+)?(the\s+)?(phones?|products?|devices?|items?|mobiles?)\b/i,
    /\b(which|what)\s+(phones?|products?|devices?).*\b(have|got|available|stock|sell)\b/i,
    /\b(phones?|products?|devices?|mobiles?).*\b(do you have|have you got|available|in stock)\b/i,
    /\b(show|list|tell).*\b(phones?|products?|devices?|inventory|stock)\b/i,
    /\b(all|any)\s+(the\s+)?(phones?|products?|devices?|mobiles?)\b/i,
    /\bwhat do you (have|sell)\b/i,
    /\bwhat('s| is) available\b/i,
  ];

  if (!browsePatterns.some((re) => re.test(lower))) return false;

  // If the user also named a specific model/brand token, treat it as a product lookup
  const tokens = tokenizeSearchQuery(lower);
  const specific = tokens.filter((t) => !CATEGORY_SEARCH_TOKENS.has(t));
  return specific.length === 0;
}

function tokenizeSearchQuery(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s+]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !SEARCH_STOPWORDS.has(t));
}

/** Soften wall-of-text model replies into readable line breaks (no product hardcoding). */
function structureChatReply(text: string): string {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+(\d+\.\s+)/g, '\n\n$1')
    .replace(/\s+([-*•])\s+(Price|Specs|Stock|Brand|Discount)\s*:/gi, '\n   - $2:')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function scoreProductAgainstTokens(product: { name?: string; brand?: string; category?: string }, tokens: string[]) {
  const name = String(product.name || '').toLowerCase();
  const brand = String(product.brand || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();
  const haystack = `${name} ${brand} ${category}`;

  let score = 0;
  let matchedTokens = 0;
  let nameOrBrandMatches = 0;

  for (const token of tokens) {
    if (!haystack.includes(token)) continue;
    matchedTokens += 1;

    // Longer / more specific tokens matter more
    const weight = Math.max(1, token.length);
    if (name.includes(token)) {
      score += weight * 3;
      nameOrBrandMatches += 1;
    } else if (brand.includes(token)) {
      score += weight * 2;
      nameOrBrandMatches += 1;
    } else {
      // Category-only hits are weak — don't treat as a product pick
      score += Math.max(1, Math.floor(weight / 3));
    }

    // Bonus when token is a whole word in the product name
    if (new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(name)) {
      score += weight;
    }
  }

  // Prefer covering more of the query tokens
  score += matchedTokens * 5;
  score += nameOrBrandMatches * 8;

  // Strong bonus when the full cleaned query phrase appears in the name
  const phrase = tokens.join(' ');
  if (phrase && name.includes(phrase)) score += 50;

  return { score, matchedTokens, nameOrBrandMatches };
}

/** Only auto-open a page when the user asked for a specific product with a name/brand match. */
function shouldNavigateToProduct(userText: string, product: { name?: string; brand?: string; category?: string } | null | undefined) {
  if (!product || isBrowseInventoryQuery(userText) || isGreeting(userText)) return false;
  const tokens = tokenizeSearchQuery(userText).filter((t) => !CATEGORY_SEARCH_TOKENS.has(t));
  if (tokens.length === 0) return false;
  const { score, nameOrBrandMatches } = scoreProductAgainstTokens(product, tokens);
  return nameOrBrandMatches >= 1 && score >= 20;
}

async function findProductsForQuery(rawQuery: string) {
  const tokens = tokenizeSearchQuery(rawQuery);
  if (tokens.length === 0) return [];

  // Candidate set: products matching any token (broad recall)
  const candidates = await Product.find({
    $or: tokens.flatMap((token) => [
      { name: { $regex: token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { brand: { $regex: token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { category: { $regex: token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    ]),
  }).limit(40);

  if (candidates.length === 0) return [];

  const ranked = candidates
    .map((product) => {
      const { score, matchedTokens, nameOrBrandMatches } = scoreProductAgainstTokens(product as any, tokens);
      return { product, score, matchedTokens, nameOrBrandMatches };
    })
    // Prefer name/brand matches; category-only hits are last-resort
    .filter((item) => {
      if (item.score <= 0) return false;
      if (tokens.length >= 2) {
        return item.nameOrBrandMatches >= 1 && (item.matchedTokens >= 2 || item.score >= 20);
      }
      return item.nameOrBrandMatches >= 1;
    })
    .sort((a, b) => b.score - a.score || String(a.product.name).localeCompare(String(b.product.name)));

  // If strict filter removed everything, fall back to best name/brand score
  const finalRanked =
    ranked.length > 0
      ? ranked
      : candidates
          .map((product) => {
            const { score, matchedTokens, nameOrBrandMatches } = scoreProductAgainstTokens(product as any, tokens);
            return { product, score, matchedTokens, nameOrBrandMatches };
          })
          .filter((item) => item.nameOrBrandMatches >= 1 && item.score > 0)
          .sort((a, b) => b.score - a.score);

  return finalRanked.slice(0, 5).map((item) => item.product);
}

// Chat AI — Nvidia Nemotron via OpenRouter with live inventory grounding
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const ai = getAIClient();

  // No external API key → local inventory assistant only
  if (!ai) {
    try {
      const local = await localShoppingAssistant(messages);
      return res.json({ ...local, provider: 'local', model: 'inventory-assistant' });
    } catch (error: any) {
      console.error('Local chat error:', error);
      return res.status(500).json({ error: 'Failed to search store inventory' });
    }
  }

  const { client, provider } = ai;
  const modelChain = resolveChatModelChain(provider);
  let activeModel = modelChain[0];

  try {
    const lastUser = [...(messages || [])].reverse().find((m: any) => m.role === 'user');
    const userText = String(lastUser?.content || '').trim();

    // Pre-fetch inventory context (RAG grounding) so the model answers from real stock
    let inventoryContext = '';
    let actionPayload: { type: 'navigate'; url: string } | null = null;
    let matchedProductName: string | null = null;
    const browseMode = Boolean(userText && isBrowseInventoryQuery(userText));

    if (userText && !isGreeting(userText)) {
      if (browseMode) {
        const available = await Product.find({ stock: { $gt: 0 } }).limit(12);
        inventoryContext =
          'User asked for a GENERAL catalog / “what do you have” list. Do NOT open any product page.\nIn-stock products:\n' +
          available
            .map(
              (p: any) =>
                `- ${p.name} | brand: ${p.brand} | category: ${p.category} | price: LKR ${p.price} | discount: ${p.discount}% | stock: ${p.stock} | specs: ${JSON.stringify(p.specs || {})}`,
            )
            .join('\n');
      } else {
        const foundProducts = await findProductsForQuery(userText);

        if (foundProducts.length > 0) {
          const top = foundProducts[0] as any;
          matchedProductName = top.name;
          if (shouldNavigateToProduct(userText, top)) {
            actionPayload = { type: 'navigate', url: `/product/${top._id}` };
          }
          inventoryContext = foundProducts
            .map(
              (p: any) =>
                `- ${p.name} | brand: ${p.brand} | category: ${p.category} | price: LKR ${p.price} | discount: ${p.discount}% | stock: ${p.stock} | id: ${p._id} | specs: ${JSON.stringify(p.specs || {})}`,
            )
            .join('\n');
        } else {
          const available = await Product.find({ stock: { $gt: 0 } }).limit(6);
          inventoryContext =
            'No exact match. Available products:\n' +
            available
              .map((p: any) => `- ${p.name} | brand: ${p.brand} | price: LKR ${p.price} | stock: ${p.stock} | id: ${p._id}`)
              .join('\n');
        }
      }
    } else {
      const available = await Product.find({ stock: { $gt: 0 } }).limit(6);
      inventoryContext =
        'Current in-stock products:\n' +
        available
          .map((p: any) => `- ${p.name} | brand: ${p.brand} | price: LKR ${p.price} | stock: ${p.stock}`)
          .join('\n');
    }

    const systemPrompt = {
      role: 'system',
      content: `You are a helpful, expert AI shopping assistant for Trust Mobile (Sri Lanka). You help users find tech devices, compare specs, and recommend products from OUR store inventory only.

STRICT RULES:
1) Only answer questions about Trust Mobile, phones, tablets, accessories, store policies, or shopping.
2) Use ONLY the LIVE INVENTORY CONTEXT below — never invent products, prices, or stock.
3) Keep answers concise, friendly, and clear. Prices are in LKR.
4) FORMATTING (required): Use markdown with real line breaks. For multiple products use a numbered list like:
   1. **Product Name**
      - Price: LKR ...
      - Specs: ...
      - Stock: ...
   Put a blank line between products. Never dump everything into one paragraph.
5) NAVIGATION: ${
        actionPayload && matchedProductName
          ? `The user asked about a specific product ("${matchedProductName}"). Confirm availability and briefly say you are opening that product page now.`
          : 'This is a general/browse question OR no single specific product was requested. List matching items only — do NOT say you are opening a product page.'
      }
6) If unrelated to shopping/tech store topics, politely refuse.

LIVE INVENTORY CONTEXT:
${inventoryContext || 'No products loaded.'}`,
    };

    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'check_product_availability',
          description: 'Search the store database to check if a specific product or brand is available in stock.',
          parameters: {
            type: 'object',
            properties: {
              searchQuery: {
                type: 'string',
                description: 'The name or brand of the product the user is asking for (e.g. "iPhone 15", "Samsung", "AirPods").',
              },
            },
            required: ['searchQuery'],
          },
        },
      },
    ];

    let currentMessages = [systemPrompt, ...messages];

    const createCompletion = async (withTools: boolean) => {
      const result = await createCompletionWithFallback({
        client,
        provider,
        models: modelChain,
        messages: currentMessages,
        withTools,
        tools: withTools ? tools : undefined,
      });
      activeModel = result.model;
      return result.completion;
    };

    const pickMessage = (completion: any) => {
      const choice = completion?.choices?.[0];
      return choice?.message ?? null;
    };

    // Prefer plain chat with RAG context first (more reliable on free Nemotron than tools)
    let responseMessage = pickMessage(await createCompletion(false));

    // Optional tool pass only if the first response is empty
    if (!responseMessage?.content && !responseMessage?.tool_calls?.length) {
      try {
        const toolCompletion = await createCompletion(true);
        responseMessage = pickMessage(toolCompletion) ?? responseMessage;
      } catch (toolError: any) {
        console.warn('Tool-calling failed:', toolError?.message);
      }
    }

    if (responseMessage?.tool_calls?.length) {
      currentMessages.push(responseMessage as any);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          const result = await searchProductsForChat(args.searchQuery || userText);
          // Never navigate on general catalog questions; otherwise trust tool result
          if (browseMode) {
            actionPayload = null;
          } else if (result.action) {
            actionPayload = result.action;
          } else {
            actionPayload = null;
          }

          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: result.toolContent,
          });
        }
      }

      const completion2 = await createCompletion(false);
      const finalMessage = pickMessage(completion2);
      return res.json({
        message: normalizeChatMessage(
          finalMessage || {
            role: 'assistant',
            content: matchedProductName
              ? `Yes — ${matchedProductName} is available. Opening the product page for you now.`
              : 'Here is what I found in our inventory.',
          },
        ),
        action: actionPayload,
        provider,
        model: activeModel,
      });
    }

    // If the model returned no usable text but we have a product match, still respond + navigate
    const normalized = normalizeChatMessage(
      responseMessage || {
        role: 'assistant',
        content: matchedProductName
          ? `Yes — ${matchedProductName} is available in our store. I'm opening that product page for you now.`
          : inventoryContext
            ? `Here is what I found in our live inventory:\n${inventoryContext}`
            : 'I could not generate a response right now. Please try again.',
      },
    );

    res.json({
      message: normalized,
      action: actionPayload,
      provider,
      model: activeModel,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);

    // If every free model is rate-limited, still answer shopping questions from live inventory
    if (isRetryableModelError(error)) {
      try {
        const local = await localShoppingAssistant(messages);
        return res.json({
          ...local,
          provider: 'local-fallback',
          model: 'inventory-assistant',
          notice: 'Cloud AI is rate-limited right now, so I answered from live store inventory.',
        });
      } catch (localError: any) {
        console.error('Local inventory fallback failed:', localError?.message);
      }
    }

    res.status(500).json({ error: formatAIError(error) });
  }
});

export default app;
