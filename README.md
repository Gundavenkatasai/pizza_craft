# 🍕 Pizza  - Unified Platform

A full-stack pizza delivery platform with customer ordering website and admin dashboard, deployed as a single unified application.

## 🚀 Live Demo

**Production URL**: `https://pizza-craft-sepia.vercel.app/`

- Main Website: `https://pizza-craft-sepia.vercel.app/`
- Admin Dashboard: `https://pizza-craft-1zi3.vercel.app/`

## ✨ Features

### Customer Website

- 🛒 Browse menu and add items to cart
- 💳 Secure checkout with Razorpay integration
- 📱 Real-time order tracking
- 👤 User authentication and profile management
- 📧 Email notifications for order updates

### Admin Dashboard

- 📊 Real-time order management
- 👥 Customer analytics
- 📦 Order status updates
- 💰 Revenue tracking
- 🔄 Live synchronization with customer app

### Backend API

- 🔐 JWT authentication
- 🗄️ MongoDB database
- 🔌 Socket.IO for real-time updates
- 📧 Email service integration
- 💳 Payment gateway integration

## 🏗️ Tech Stack

**Frontend**

- React 18 + TypeScript
- React Router v6
- Tailwind CSS
- Vite
- Socket.IO Client
- Axios

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Razorpay Payment Integration
- Nodemailer

**Deployment**

- Vercel (Unified deployment)
- MongoDB Atlas

## 📁 Project Structure

```
pizza-vamsi/
├── project/                # Main customer website
│   ├── src/               # React source code
│   ├── dist/              # Production build (generated)
│   └── server/            # Express backend
│       ├── routes/        # API routes
│       ├── models/        # Mongoose models
│       ├── middleware/    # Auth & error handling
│       └── services/      # Email, Socket.IO
├── admin-dashboard/       # Admin panel
│   ├── src/              # React source code
│   └── dist/             # Production build (generated)
├── scripts/              # Utility scripts
├── .githooks/            # Git hooks for security
├── vercel.json           # Vercel configuration
└── package.json          # Unified dependencies
```

## 🛠️ Local Development

### Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**

```powershell
git clone <your-repo-url>
cd pizza-vamsi
```

2. **Install all dependencies**

```powershell
npm run install:all
```

3. **Set up environment variables**

```powershell
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values
```

4. **Start development servers**

```powershell
# Start all three servers (backend, frontend, admin)
npm run dev

# Or start individually:
npm run dev:backend    # Backend API on :3001
npm run dev:frontend   # Main app on :5173
npm run dev:admin      # Admin on :5001
```

### Development URLs

- Main Website: `http://localhost:5173`
- Admin Dashboard: `http://localhost:5001`
- Backend API: `http://localhost:3001`

## 🚢 Deployment

### Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**

1. **Push to GitHub**

```powershell
git add .
git commit -m "Ready for deployment"
git push
```

2. **Deploy on Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure environment variables
- Deploy!

3. **Set Environment Variables in Vercel**
   Required variables (see `.env.example`):

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL` (your Vercel domain)
- Optional: `RAZORPAY_KEY_ID`, `EMAIL_USER`, etc.

## 🔐 Security

- ✅ Environment variables for secrets
- ✅ Pre-commit hooks to prevent secret leaks
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation

## 📝 Environment Variables

See `.env.example` for all available variables.

### Required

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - Your app's URL

### Optional

- `EMAIL_USER`, `EMAIL_PASS` - For email notifications
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - For payments
- `PORT` - Server port (default: 3001)

## 🧪 Testing

```powershell
# Build for production locally
npm run build

# Test production build
$env:NODE_ENV="production"
npm start

# Visit http://localhost:3001
```

## 📚 Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [CORS Configuration](./CORS_FIX.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- Deployed frontend on Vercel
- Deployed backend on Render
- Payment integration by Razorpay

---

**Made with ❤️ by Venkatasai**
