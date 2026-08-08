# 🍕 PizzaCraft - Unified Full-Stack Platform

A full-stack pizza delivery platform with a modern customer ordering web app, Admin Dashboard, and Super Admin Portal, built as a unified multi-portal application.

---

## 🚀 Live Production Links

- **Main Customer Website**: [https://pizza-craft-1zi3.vercel.app/](https://pizza-craft-1zi3.vercel.app/)
- **Admin Dashboard**: [https://pizza-craft-1zi3.vercel.app/admin](https://pizza-craft-1zi3.vercel.app/admin)
- **Super Admin Portal**: [https://pizza-craft-1zi3.vercel.app/super-admin](https://pizza-craft-1zi3.vercel.app/super-admin)
- **Production Backend API**: [https://pizza-craft-0aov.onrender.com](https://pizza-craft-0aov.onrender.com)
- **GitHub Repository**: [https://github.com/Gundavenkatasai/pizza_craft.git](https://github.com/Gundavenkatasai/pizza_craft.git)

---

## 🔑 Access Credentials

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Customer App** | `venkatasaigunda82@gmail.com` | `sai@1234` | Customer |
| **Admin Dashboard** | `admin@pizzacraft.com` | `admin123` | Admin |
| **Super Admin Portal** | `admin@pizzacraft.com` | `admin123` | Super Admin |

---

## ✨ Features & Recent Enhancements

### 🛒 Customer Ordering Website
- **Curated Food Photography**: 105+ high-resolution, item-matched photography assets (no default placeholder images).
- **Accurate Real-Time Pricing**: 100% harmonized unit pricing across cards, detail modals, cart, checkout, and backend persistence.
- **Dynamic Size Multipliers**: Small (`1.0x`), Medium (`1.3x`), Large (`1.6x`), and XL (`2.0x`) for pizzas; Regular (`1.0x`) for desserts, sides, and beverages.
- **Payment Integration**: Seamless checkout powered by Razorpay with ad-blocker network guards.
- **User Authentication**: JWT-based login, auto-password updates on re-registration, per-user persistent carts, and real-time order tracking.

### 🛡️ Admin & Super Admin Portals
- **Live Order Management**: Real-time Socket.IO synchronization, multi-endpoint order fetching, and status management (Pending, Preparing, Out for Delivery, Delivered).
- **Role-Based Access Control (RBAC)**: Secure access verification supporting `super_admin`, `admin`, `restaurant_admin`, and `staff` roles.
- **Customer & Inventory Analytics**: User management, menu customization, and sales tracking.

### ⚙️ Backend API & Architecture
- **MongoDB Atlas Integration**: Remote database with automated seeding scripts for 105 distinct menu items.
- **Order Total Recalculation**: Server-side verification matching 8% GST tax, subtotal, and delivery rules exactly.
- **CORS & Security**: Allowed and exposed headers for `x-rtb-fingerprint-id`, `request-id`, `Authorization`, and `Content-Type`. Protected `.env` files shielding credentials from public repositories.
- **Vercel Serverless Rewrites**: Native `/api/(.*)` mapping to serverless functions with dual route fallbacks.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, React Router v6, Tailwind CSS, Vite, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB Atlas + Mongoose, Socket.IO, JWT Authentication, Nodemailer.
- **Payments**: Razorpay Payment Gateway API v1.
- **Deployment**: Vercel (Unified Frontend & Serverless API), Render (Production Backend Service), MongoDB Atlas (Cloud Database).

---

## 📁 Repository Structure

```text
pizza_craft/
├── project/                     # Main Customer Frontend & Express Server
│   ├── src/                    # React frontend application
│   ├── server/                 # Express API server (routes, models, controllers)
│   │   ├── routes/             # Auth, Orders, Menu, Admin routes
│   │   ├── models/             # Mongoose schemas (User, Order, Pizza)
│   │   ├── middleware/         # JWT authentication & RBAC middleware
│   │   └── services/           # Order calculations & Socket.IO services
│   └── seed-menu.js            # Automated database menu seeding script
├── admin-dashboard/            # Restaurant Admin Dashboard (Vite + React)
│   └── src/                    # Admin pages, components, and socket services
├── super-admin-dashboard/      # Super Admin Control Portal (Vite + React)
│   └── src/                    # System administration and user role management
├── api/                        # Vercel serverless entry points (index.js)
├── vercel.json                 # Vercel deployment routing & rewrite rules
└── package.json                # Unified workspace dependencies & runner scripts
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **MongoDB**: MongoDB Atlas Cluster URL or local instance.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gundavenkatasai/pizza_craft.git
   cd pizza_craft
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**
   Create `.env` in `project/server/`:
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Run Development Servers**
   ```bash
   # Run all components concurrently
   npm run dev

   # Or run individual services:
   npm run dev:backend       # Express Server (Port 3001 / 5001)
   npm run dev:frontend      # Customer App (Port 5173)
   npm run dev:admin         # Admin Dashboard (Port 5001)
   npm run dev:superadmin    # Super Admin Dashboard (Port 5175)
   ```

---

## 🚢 Deployment Configuration

### Vercel Deployment Settings
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Rewrite Config (`vercel.json`)**:
  ```json
  {
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.js" },
      { "source": "/admin/(.*)", "destination": "/admin-dashboard/index.html" },
      { "source": "/super-admin/(.*)", "destination": "/super-admin-dashboard/index.html" },
      { "source": "/(.*)", "destination": "/project/index.html" }
    ]
  }
  ```

---

## 📄 License

MIT License — Feel free to customize and use this project.

---

**Built with ❤️ by Venkatasai**
