import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Auth: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    console.log('✅ Auth: Token decoded, userId:', decoded.userId);

    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      console.error('❌ Auth: User not found for userId:', decoded.userId);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log('✅ Auth: User found:', user.email, 'role:', user.role);
    req.user = {
      ...user,
      id: user._id.toString() // Ensure id field exists
    };
    console.log('✅ Auth: Set req.user with id:', req.user.id, 'role:', req.user.role);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId).lean();
    if (user) {
      req.user = {
        ...user,
        id: user._id.toString()
      };
    }
  } catch (error) {
    // Ignore error for optional auth
    console.log('Optional Auth: Invalid token ignored');
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!['admin', 'super_admin', 'restaurant_admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!['super_admin', 'admin', 'restaurant_admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

export const requireStaff = (req, res, next) => {
  if (!['admin', 'super_admin', 'restaurant_admin', 'manager', 'kitchen_staff', 'delivery_staff', 'staff'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
};