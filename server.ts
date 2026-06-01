import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import 'dotenv/config';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'matrix-mobiles-super-secret-key';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [mongoose.Schema.Types.Mixed],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'processing' },
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
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@matrix.com', password: hash, role: 'admin' });
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

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Require Admin Role' });
  }
  next();
};

// Database connection singleton
let isConnected = false;
export const connectDB = async () => {
  if (isConnected) return;
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no external MongoDB URI is provided, start a local in-memory one
    if (!mongoUri) {
      if (process.env.VERCEL) {
        throw new Error("CRITICAL: MONGODB_URI environment variable is missing in Vercel. Please add it to your Vercel project settings.");
      }
      console.log('No MONGODB_URI provided, starting in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`\n========================================`);
    console.log(`✅ MongoDB Successfully Connected!`);
    console.log(`🚀 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`========================================\n`);

    isConnected = true;
    await seedData();
    console.log('Database seeded');
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error);
    if (process.env.VERCEL && !process.env.MONGODB_URI) {
      // Rethrow to allow serverless function to explicitly fail instead of hanging
      throw error;
    }
  }
};

// --- API ROUTES ---

// Serverless DB connection middleware
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error("API Middleware DB Error:", error);
    res.status(500).json({ error: 'Internal Server Error: Database connection failed. Please check environment variables.' });
  }
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: 'user' });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const result = await bcrypt.compare(password, user.password as string);
    if (result) {
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '24h' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
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

app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
  const { name, brand, category, price, discount, stock, images, specs } = req.body;

  try {
    const newProd = await Product.create({
      name, brand, category, price: parseFloat(price), discount: parseFloat(discount || 0), stock: parseInt(stock || 0), images, specs
    });
    res.status(201).json({ id: newProd._id, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, brand, category, price, discount, stock, images, specs } = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, {
      name, brand, category, price: parseFloat(price), discount: parseFloat(discount || 0), stock: parseInt(stock || 0), images, specs
    }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Orders
app.post('/api/orders', authenticateToken, async (req: any, res) => {
  const { items, totalPrice, address } = req.body;
  const userId = req.user.id;

  try {
    const newOrder = await Order.create({
      userId, items, totalPrice, paymentStatus: 'pending', orderStatus: 'processing', address
    });
    res.status(201).json({ id: newOrder._id, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authenticateToken, async (req: any, res) => {
  const userId = req.user.id;

  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { userId };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
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
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
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

app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
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

app.post('/api/ads', authenticateToken, isAdmin, async (req, res) => {
  try {
    const ad = await Advertisement.create(req.body);
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ad' });
  }
});

app.put('/api/ads/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

app.delete('/api/ads/:id', authenticateToken, isAdmin, async (req, res) => {
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

app.post('/api/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', authenticateToken, isAdmin, async (req, res) => {
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

app.post('/api/brands', authenticateToken, isAdmin, async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create brand' });
  }
});

app.put('/api/brands/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

app.delete('/api/brands/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Brand not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Chat AI
app.post('/api/chat', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { messages } = req.body;

    const systemPrompt = {
      role: 'system',
      content: 'You are a helpful, expert AI shopping assistant for Matrix Mobiles. You help users find the best tech devices, compare specifications, and provide recommendations based on their needs. Keep your answers concise, friendly, and formatted neatly. STRICT RULE: You MUST ONLY answer questions related to Matrix Mobiles, mobile phones, tech accessories, store policies, or shopping. If a user asks a question completely unrelated to these topics (such as writing code, math, history, general knowledge, etc.), you must politely refuse to answer and remind them that you are strictly a Matrix Mobiles shopping assistant. IMPORTANT: If the user asks about a specific product, phone, or device, you MUST use the `check_product_availability` function to query the database. Do NOT guess if a product is available.'
    };

    const tools = [
      {
        type: 'function',
        function: {
          name: 'check_product_availability',
          description: 'Search the store database to check if a specific product or brand is available in stock.',
          parameters: {
            type: 'object',
            properties: {
              searchQuery: {
                type: 'string',
                description: 'The name or brand of the product the user is asking for (e.g. "iPhone 15", "Samsung", "AirPods").'
              }
            },
            required: ['searchQuery']
          }
        }
      }
    ];

    let currentMessages = [systemPrompt, ...messages];
    let actionPayload = null;

    const completion1 = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      // @ts-ignore
      messages: currentMessages,
      // @ts-ignore
      tools: tools,
      tool_choice: 'auto',
      max_tokens: 500,
    });

    const responseMessage = completion1.choices[0].message;

    // Check if the model wanted to call a function
    if (responseMessage.tool_calls) {
      currentMessages.push(responseMessage as any);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments);
          const query = args.searchQuery;

          // Search the database
          const foundProducts = await Product.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { brand: { $regex: query, $options: 'i' } }
            ]
          }).limit(3);

          if (foundProducts.length > 0) {
            const matchedProduct = foundProducts[0];
            actionPayload = { type: 'navigate', url: `/product/${matchedProduct._id}` };

            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({
                status: 'found',
                message: `Product found: ${matchedProduct.name} by ${matchedProduct.brand}. Price: LKR ${matchedProduct.price}. Tell the user we have it in stock and that you are automatically navigating them to the product page right now.`
              })
            });
          } else {
            const availableProducts = await Product.find({ stock: { $gt: 0 } }).limit(3);
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({
                status: 'not_found',
                message: `Product '${query}' not found in database. Here are some available alternatives to suggest to the user: ${availableProducts.map(p => p.name).join(', ')}.`
              })
            });
          }
        }
      }

      // Call OpenAI again to let it summarize the tool results
      const completion2 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        // @ts-ignore
        messages: currentMessages,
        max_tokens: 500,
      });

      return res.json({
        message: completion2.choices[0].message,
        action: actionPayload
      });
    }

    res.json({
      message: responseMessage,
      action: actionPayload
    });
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// Start Server
async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if we are NOT running in a Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
