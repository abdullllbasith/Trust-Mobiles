import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import OpenAI from 'openai';

const AI_MODEL = process.env.AI_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';
const openai = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Matrix Mobiles',
      },
    })
  : null;

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'matrix-mobiles-super-secret-key';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Data Store
let users: any[] = [];
let products: any[] = [];
let orders: any[] = [];
let ads: any[] = [];
let categories: any[] = [];
let brands: any[] = [];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Seed Data
const seedData = async () => {
  if (users.filter(u => u.role === 'admin').length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    users.push({ id: generateId(), name: 'Admin', email: 'admin@matrix.com', password: hash, role: 'admin', createdAt: new Date() });
  }

  if (products.length === 0) {
    products.push(
      {
        id: generateId(), name: "Google Pixel 8 Pro", brand: "Google", category: "Phones", price: 999, discount: 10, stock: 50,
        images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "12GB", storage: "256GB", processor: "Google Tensor G3" }, createdAt: new Date()
      },
      {
        id: generateId(), name: "Samsung Galaxy S24", brand: "Samsung", category: "Phones", price: 1199, discount: 5, stock: 30,
        images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "8GB", storage: "256GB", processor: "Exynos 2400" }, createdAt: new Date()
      },
      {
        id: generateId(), name: "iPhone 15 Pro", brand: "Apple", category: "Phones", price: 1099, discount: 0, stock: 20,
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800"],
        specs: { ram: "8GB", storage: "256GB", processor: "A17 Pro" }, createdAt: new Date()
      },
      {
        id: generateId(), name: "AirPods Pro", brand: "Apple", category: "Accessories", price: 249, discount: 15, stock: 100,
        images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800"],
        specs: { type: "Earbuds", anc: "Yes" }, createdAt: new Date()
      }
    );
  }

  if (categories.length === 0) {
    categories.push(
      { id: generateId(), name: "Phones", createdAt: new Date() },
      { id: generateId(), name: "Tablets", createdAt: new Date() },
      { id: generateId(), name: "Accessories", createdAt: new Date() },
      { id: generateId(), name: "Audio", createdAt: new Date() }
    );
  }

  if (brands.length === 0) {
    brands.push(
      { id: generateId(), name: "Apple", categories: ["Phones", "Tablets", "Accessories", "Audio"], createdAt: new Date() },
      { id: generateId(), name: "Samsung", categories: ["Phones", "Tablets", "Accessories"], createdAt: new Date() },
      { id: generateId(), name: "Google", categories: ["Phones", "Accessories"], createdAt: new Date() },
      { id: generateId(), name: "JBL", categories: ["Audio"], createdAt: new Date() },
      { id: generateId(), name: "Sony", categories: ["Phones", "Audio"], createdAt: new Date() }
    );
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

// --- API ROUTES ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  
  try {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hash = await bcrypt.hash(password, 10);
    const user = { id: generateId(), name, email, password: hash, role: 'user', createdAt: new Date() };
    users.push(user);
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const result = await bcrypt.compare(password, user.password as string);
    if (result) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
    const sortedProducts = [...products].sort((a, b) => b.createdAt - a.createdAt);
    res.json(sortedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Invalid product ID' });
  }
});

app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
  const { name, brand, category, price, discount, stock, images, specs } = req.body;
  
  try {
    const newProd = {
      id: generateId(), name, brand, category, price: parseFloat(price), discount: parseFloat(discount || 0), stock: parseInt(stock || 0), images, specs, createdAt: new Date()
    };
    products.push(newProd);
    res.status(201).json({ id: newProd.id, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, brand, category, price, discount, stock, images, specs } = req.body;
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products[index] = {
      ...products[index],
      name, brand, category, price: parseFloat(price), discount: parseFloat(discount || 0), stock: parseInt(stock || 0), images, specs
    };
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Orders
app.post('/api/orders', authenticateToken, async (req: any, res) => {
  const { items, totalPrice, address } = req.body;
  const userId = req.user.id;
  
  try {
    const newOrder = {
      id: generateId(), userId, items, totalPrice, paymentStatus: 'pending', orderStatus: 'processing', address, createdAt: new Date()
    };
    orders.push(newOrder);
    res.status(201).json({ id: newOrder.id, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  
  try {
    let result = orders;
    if (req.user.role !== 'admin') {
      result = orders.filter(o => o.userId === userId);
    }
    result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    
    orders[index] = { ...orders[index], orderStatus, paymentStatus };
    res.json(orders[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Users
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const usersWithoutPassword = users.map(({ password, ...u }) => u).sort((a, b) => b.createdAt - a.createdAt);
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    
    users[index] = { ...users[index], name, email, role };
    const { password, ...updatedUser } = users[index];
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    users.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Advertisements
app.get('/api/ads', async (req, res) => {
  try {
    const sortedAds = [...ads].sort((a, b) => b.createdAt - a.createdAt);
    res.json(sortedAds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

app.post('/api/ads', authenticateToken, isAdmin, async (req, res) => {
  try {
    const newAd = { id: generateId(), ...req.body, createdAt: new Date() };
    ads.push(newAd);
    res.status(201).json(newAd);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ad' });
  }
});

app.put('/api/ads/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = ads.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ad not found' });
    
    ads[index] = { ...ads[index], ...req.body };
    res.json(ads[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

app.delete('/api/ads/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = ads.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ad not found' });
    ads.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const newCat = { id: generateId(), ...req.body, createdAt: new Date() };
    categories.push(newCat);
    res.status(201).json(newCat);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    categories.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Brands
app.get('/api/brands', async (req, res) => {
  try {
    const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

app.post('/api/brands', authenticateToken, isAdmin, async (req, res) => {
  try {
    const newBrand = { id: generateId(), ...req.body, createdAt: new Date() };
    brands.push(newBrand);
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create brand' });
  }
});

app.put('/api/brands/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = brands.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Brand not found' });
    brands[index] = { ...brands[index], ...req.body };
    res.json(brands[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

app.delete('/api/brands/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const index = brands.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Brand not found' });
    brands.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Chat AI
app.post('/api/chat', async (req, res) => {
  if (!openai) {
    return res.status(500).json({ error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env' });
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

    let completion1;
    try {
      completion1 = await openai.chat.completions.create({
        model: AI_MODEL,
        // @ts-ignore
        messages: currentMessages,
        // @ts-ignore
        tools: tools,
        tool_choice: 'auto',
        max_tokens: 800,
      });
    } catch {
      completion1 = await openai.chat.completions.create({
        model: AI_MODEL,
        // @ts-ignore
        messages: currentMessages,
        max_tokens: 800,
      });
    }

    const responseMessage = completion1.choices[0].message;

    if (responseMessage.tool_calls) {
      currentMessages.push(responseMessage as any);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const args = JSON.parse(toolCall.function.arguments);
          const query = args.searchQuery.toLowerCase();

          const foundProducts = products.filter(p => 
            p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
          ).slice(0, 3);

          if (foundProducts.length > 0) {
            const matchedProduct = foundProducts[0];
            actionPayload = { type: 'navigate', url: `/product/${matchedProduct.id}` };
            
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
            const availableProducts = products.filter(p => p.stock > 0).slice(0, 3);
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({
                status: 'not_found',
                message: `Product '${args.searchQuery}' not found in database. Here are some available alternatives to suggest to the user: ${availableProducts.map(p => p.name).join(', ')}.`
              })
            });
          }
        }
      }

      const completion2 = await openai.chat.completions.create({
        model: AI_MODEL,
        // @ts-ignore
        messages: currentMessages,
        max_tokens: 800,
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
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// Start Server
async function startServer() {
  await seedData();
  console.log('In-Memory Mock Database seeded');

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

startServer();
