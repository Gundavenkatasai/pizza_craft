import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import inventoryRoutes from './routes/inventory.js';
import migrateRoutes from './routes/migrate.js';
import paymentRoutes from './routes/payment.js';
import categoryRoutes from './routes/categories.js';
import couponRoutes from './routes/coupons.js';
import bannerRoutes from './routes/banners.js';
import settingsRoutes from './routes/settings.js';
import analyticsRoutes from './routes/analytics.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import services
import { initializeSocket } from './services/socketService.js';
import { connectMongo, testConnection } from './config/database.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple CORS only
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting (relaxed in development to prevent accidental 429s during HMR / double effects)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests, please try again later' }
  });
  app.use(limiter);
} else {
  // In development, still guard extreme abuse but allow generous limit
  const devLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(devLimiter);
}

// Initialize Socket.IO
initializeSocket(io);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Ensure MongoDB is connected before any API route runs.
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const connected = await connectMongo();
  if (!connected) {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('PizzaCraft API Running');
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const connected = await testConnection();

  if (!connected) {
    console.error('❌ MongoDB connection failed. Server will not start until the database is available.');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzacraft.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: adminEmail,
      password_hash: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      email_verified: true
    });
    console.log(`✅ Seeded admin user: ${adminEmail}`);
  } else {
    const passwordMatches = await bcrypt.compare(adminPassword, existingAdmin.password_hash || '');
    let needsUpdate = false;

    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      needsUpdate = true;
    }

    if (!passwordMatches) {
      existingAdmin.password_hash = hashedPassword;
      needsUpdate = true;
    }

    if (!existingAdmin.email_verified) {
      existingAdmin.email_verified = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await existingAdmin.save();
      console.log(`✅ Repaired admin user: ${adminEmail}`);
    } else {
      console.log(`✅ Admin user verified: ${adminEmail}`);
    }
  }

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});
