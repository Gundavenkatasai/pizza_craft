import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from '../project/server/routes/auth.js';
import menuRoutes from '../project/server/routes/menu.js';
import orderRoutes from '../project/server/routes/orders.js';
import adminRoutes from '../project/server/routes/admin.js';
import inventoryRoutes from '../project/server/routes/inventory.js';
import migrateRoutes from '../project/server/routes/migrate.js';
import paymentRoutes from '../project/server/routes/payment.js';
import categoryRoutes from '../project/server/routes/categories.js';
import couponRoutes from '../project/server/routes/coupons.js';
import bannerRoutes from '../project/server/routes/banners.js';
import settingsRoutes from '../project/server/routes/settings.js';
import analyticsRoutes from '../project/server/routes/analytics.js';

// Import middleware
import { errorHandler } from '../project/server/middleware/errorHandler.js';

// Import services
import { testConnection } from '../project/server/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors());

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests, please try again later' }
  });
  app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock Socket.IO for serverless (real-time features won't work)
const mockIo = {
  to: () => ({ emit: () => {} }),
  emit: () => {},
  on: () => {}
};

app.use((req, res, next) => {
  req.io = mockIo;
  next();
});

// API Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files
const publicPath = path.join(__dirname, '../public');
const adminPath = path.join(publicPath, 'admin');

// Admin dashboard
app.use('/admin', express.static(adminPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});

// Main frontend
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

// Initialize database connection
testConnection().catch(err => {
  console.error('Database connection failed:', err);
});

export default app;
