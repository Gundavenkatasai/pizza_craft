import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
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

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import services
import { initializeSocket } from './services/socketService.js';
import { testConnection } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Socket.IO
initializeSocket(io);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// DB TEST ROUTE
app.get('/api/db-test', async (req, res) => {
  try {
    const mongoose = await import('mongoose');

    res.json({
      state: mongoose.default.connection.readyState
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('PizzaCraft API Running');
});
// Error handling middleware
app.use(errorHandler);

// 404 handler (only in development, production uses SPA fallback)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Align default port with frontend expectations (frontend hardcodes 3001)
const PORT = process.env.PORT || 3001;

// For Vercel serverless deployment, export the app
// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION;

if (!isVercel) {
  // Local/traditional server mode
  // Test database connection before starting server
  testConnection().then((connected) => {
    if (connected) {
      console.log('✅ Database connected successfully');
    } else {
      console.log('⚠️ Database connection failed, but starting server anyway for development');
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Socket.IO server initialized`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch((error) => {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ Starting server anyway for development');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
      console.log(`📱 Socket.IO server initialized`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

// Export for Vercel serverless
export default app;
export { io };
