# 🍕 PizzaCraft - Full Stack Pizza Delivery Platform

A modern, real-time pizza delivery application with React frontend, Express.js backend, MongoDB database, and Socket.IO for live updates.

## ✨ Key Features

### Customer Features

- 🛒 **Browse Menu** - View all available pizzas with prices and descriptions
- 🎨 **Customize Pizzas** - Select size (Small, Medium, Large, XL) and toppings
- 🛍️ **Shopping Cart** - Add, remove, and modify items before checkout
- 💳 **Razorpay Integration** - Secure online payment processing
- 📦 **Order Tracking** - Real-time order status updates via Socket.IO
- 🔐 **User Authentication** - Secure JWT-based login/registration
- 📧 **Email Notifications** - Order confirmations and status updates
- 🤖 **AI Chatbot** - Gemini-powered assistant for menu help and recommendations
- 🌤️ **Smart Recommendations** - Weather and mood-based pizza suggestions

### Admin Features

- 📊 **Dashboard Analytics** - View orders, revenue, and customer metrics
- 🔔 **Real-time Order Notifications** - Instant alerts for new orders
- 📋 **Order Management** - Update order status and view details
- 👥 **Customer Management** - View customer information and order history
- 🔄 **Live Sync** - Socket.IO for real-time updates across all devices

### Technical Highlights

- ⚡ **Real-time Updates** - Socket.IO for instant order notifications
- 🎯 **Size-based Pricing** - Dynamic pricing (₹75-100 per size)
- 🔒 **Secret Protection** - Pre-commit hooks to prevent credential leaks
- 🌐 **CORS Support** - Works on localhost and LAN IPs
- 📱 **Responsive Design** - Tailwind CSS for mobile-first UI
- 🚀 **Production Ready** - Vercel/Render deployment configurations

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Gundavenkatasai/pizza.git
   cd pizza
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd project && npm install
   cd ../admin-dashboard && npm install
   cd ../project/server && npm install
   ```

3. **Configure environment variables**

   Create `.env` files in:

   - `project/server/.env` - Backend configuration
   - `project/.env` - Frontend configuration
   - `admin-dashboard/.env` - Admin dashboard configuration

   See `.env.example` files for required variables.

4. **Create admin user**

   ```bash
   cd project/server
   node scripts/create-admin.js
   ```

5. **Start the application**

   ```bash
   # From root directory
   npm run dev

   # Or start individually:
   # Terminal 1 - Backend
   cd project/server && node index.js

   # Terminal 2 - Frontend
   cd project && npm run dev

   # Terminal 3 - Admin Dashboard
   cd admin-dashboard && npm run dev
   ```

## 🌐 Access URLs

- **Main Website**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5001
- **Backend API**: http://localhost:3001

## 🔑 Default Admin Credentials

- **Email**: admin@pizzaapp.com
- **Password**: admin123

## 🏗️ Project Structure

```
pizza-delivery-app/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Application pages
│   ├── contexts/                 # React contexts (Auth, Cart)
│   ├── services/                 # API services
│   └── types/                    # TypeScript types
├── server/                       # Backend Express.js application
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── services/                 # Backend services
│   └── config/                   # Configuration files
├── supabase/                     # Database migrations
└── package.json                  # Main project configuration
```

## 📱 Available Scripts

### Development

- `npm start` - Run both frontend and backend together
- `npm run dev:frontend` - Run only frontend (port 5173)
- `npm run dev:backend` - Run only backend (port 3001)
- `npm run dev:full` - Run both servers concurrently

### Build & Deploy

- `npm run build` - Build frontend for production
- `npm run build:backend` - Install backend dependencies
- `npm run build:full` - Full build (backend + frontend)

### Utilities

- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔧 Features

### Frontend (React + TypeScript)

- ⚡ Vite for fast development
- 🎨 Tailwind CSS for styling
- 🔐 Supabase authentication
- 🛒 Shopping cart functionality
- 📱 Responsive design
- 🔥 Hot module replacement

### Backend (Express.js + Node.js)

- 🚀 RESTful API
- 🔒 JWT authentication
- 📊 Supabase integration
- 🔄 Real-time features (Socket.IO)
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📧 Email services

### Database (Supabase)

- 🗄️ PostgreSQL database
- 🔐 Built-in authentication
- 📝 Real-time subscriptions
- 🔄 Automatic migrations

## 🎯 Authentication Flow

The application uses **Supabase authentication** for a seamless user experience:

1. **Registration**: Users sign up with email/password
2. **Login**: Secure authentication with session management
3. **Profile Management**: User profiles with role-based access
4. **Password Reset**: Email-based password recovery

## 🛒 Core Functionality

- **Menu Browsing**: View available pizzas with filtering
- **Cart Management**: Add/remove items, calculate totals
- **Order Placement**: Complete checkout process
- **Order Tracking**: Real-time order status updates
- **Admin Panel**: Manage menu, orders, and inventory
- **User Profiles**: Manage personal information and order history

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001
```

**Backend (server/.env)**

```env
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=rzp_test_ODQ3lf6JSSFi9z
RAZORPAY_KEY_SECRET=EI21xvagP5DUVcGEl1xtS8AK
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Kill processes on specific ports
   npx kill-port 3001 5173
   ```

2. **Database Connection Issues**

   - Check Supabase configuration
   - Verify environment variables
   - Ensure internet connection

3. **Authentication Errors**
   - Verify Supabase keys in `.env` files
   - Check browser network tab for API errors

### Development Tips

- Use `npm run dev:backend` and `npm run dev:frontend` separately for debugging
- Check browser console for frontend errors
- Monitor backend logs in the terminal
- Use the health check endpoint: http://localhost:3001/api/health

## � Payment Integration

The application uses Razorpay for online payment processing with the following features:

### Payment Options

- Credit/Debit Cards
- UPI
- Netbanking
- Wallets
- Cash on Delivery (fallback)

### Test Credentials

- Key ID: `rzp_test_ODQ3lf6JSSFi9z`
- Key Secret: `EI21xvagP5DUVcGEl1xtS8AK`

### Testing

For payment testing instructions, refer to `RAZORPAY_TESTING.md` file in the project root.

### Implementation Details

- **Frontend**: React integration with Razorpay checkout.js
- **Backend**: Express routes for order creation and payment verification
- **Security**: Server-side signature verification

## �📦 Dependencies

### Frontend

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- Supabase client
- Socket.IO client
- Razorpay SDK (loaded dynamically)

### Backend

- Express.js
- Supabase
- Socket.IO
- JWT
- Bcrypt
- CORS & Helmet
- Razorpay Node SDK

### Development

- Concurrently (run multiple scripts)
- Wait-on (dependency coordination)
- ESLint + TypeScript support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

🍕 **Happy Coding!** Enjoy building your pizza delivery empire!
