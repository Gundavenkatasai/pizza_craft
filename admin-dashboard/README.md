# 🎛️ PizzaCraft Admin Dashboard

Real-time admin dashboard for managing PizzaCraft orders, customers, and analytics with live Socket.IO updates.

## ✨ Features

### 📊 Dashboard Analytics

- **Overview Metrics**: Total orders, revenue, active customers, pending orders
- **Real-time Charts**: Order trends, revenue analytics, customer growth
- **Performance Insights**: Daily/weekly/monthly statistics

### 📦 Order Management

- **Live Order Feed**: Real-time notifications for new orders via Socket.IO
- **Order Status Workflow**:
  - Pending → Confirmed → Preparing → Out for Delivery → Delivered
- **Order Details**: View customer info, items, delivery address, payment status
- **Quick Actions**: Update status, view order history, contact customer
- **Search & Filter**: Find orders by status, date, customer, or order ID

### 👥 Customer Management

- **Customer Profiles**: View customer details, contact info, registration date
- **Order History**: Complete purchase history per customer
- **Customer Stats**: Total orders, lifetime value, last order date
- **Quick Contact**: Email and phone integration

### 🔔 Real-time Features

- **Instant Notifications**: Audio/visual alerts for new orders
- **Live Status Updates**: Changes sync across all admin sessions
- **Socket.IO Integration**: WebSocket connection for real-time data
- **Admin Presence**: See which admins are currently online

### 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin-only protected routes
- **Session Management**: Automatic logout on token expiry
- **CORS Protection**: Configured for secure API communication

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running on port 3001
- MongoDB database configured
- Admin user created

### Installation

1. **Navigate to admin dashboard**

   ```bash
   cd admin-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment** (`.env`)

   ```env
   VITE_API_BASE=http://localhost:3001
   VITE_GEMINI_API_KEY=your_key_here
   VITE_WEATHER_API_KEY=your_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The dashboard will be available at `http://localhost:5001`

## 🔑 Login Credentials

Default admin account:

- **Email**: admin@pizzacraft.com
- **Password**: admin123

> ⚠️ Change these credentials in production!

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📡 API Integration

The dashboard communicates with the backend API:

- **Base URL**: `http://localhost:3001/api`
- **Auth**: JWT token in Authorization header
- **Socket**: `ws://localhost:3001` for real-time updates

### Key Endpoints

- `POST /api/auth/login` - Admin authentication
- `GET /api/admin/orders` - Fetch all orders
- `PATCH /api/admin/orders/:id` - Update order status
- `GET /api/admin/customers` - Fetch customer list
- `GET /api/admin/stats` - Dashboard analytics

## 🔄 Real-time Synchronization

### Socket.IO Events

**Listening:**

- `new-order` - New order placed by customer
- `order-updated` - Order status changed
- `order-status-changed` - Status update from any admin

**Emitting:**

- `join-admin-room` - Join admin notification room
- `update-order-status` - Broadcast status change to all clients

## 📱 Features by Page

### Dashboard (`/`)

- Key metrics cards (orders, revenue, customers)
- Recent orders table with quick actions
- Revenue and order trend charts
- Real-time order count updates

### Orders (`/orders`)

- Complete order list with pagination
- Status filter tabs (All, Pending, Confirmed, etc.)
- Search by order ID or customer name
- Click to view full order details
- Update status with dropdown
- Real-time new order notifications

### Customers (`/customers`)

- Customer directory with search
- Customer profiles with order history
- Statistics per customer
- Contact information display

## 🎨 UI Components

- **Header**: Navigation, logout, admin profile
- **Toast Notifications**: Success/error messages
- **Order Cards**: Collapsible order details
- **Status Badges**: Color-coded order status
- **Loading States**: Skeleton loaders
- **Empty States**: Helpful messages when no data

## 🐛 Troubleshooting

**Connection Issues:**

- Ensure backend server is running on port 3001
- Check MongoDB connection in backend
- Verify Socket.IO connection in browser console

**Authentication Errors:**

- Confirm admin user exists (run `create-admin.js`)
- Check JWT_SECRET matches between frontend and backend
- Clear browser localStorage and try again

**Real-time Not Working:**

- Check Socket.IO connection status
- Verify CORS settings allow your origin
- Check browser console for WebSocket errors

## 🚀 Production Deployment

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Output**: `dist/` folder ready for hosting

3. **Environment**: Update `VITE_API_BASE` to production API URL

4. **Hosting**: Compatible with Vercel, Netlify, Render, etc.

## 🔒 Security Best Practices

- Change default admin credentials
- Use strong JWT secrets in production
- Enable HTTPS for all API requests
- Implement rate limiting
- Add IP whitelisting for admin access
- Enable audit logging for admin actions

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── pages/         # Route components
├── services/      # API and Socket.IO services
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

## 📄 License

This project is part of the PizzaCraft platform.

## 🤝 Support

For issues or questions:

- Check backend logs for API errors
- Review browser console for frontend errors
- Verify environment variables are set correctly
- Ensure all services are running (backend, MongoDB, frontend)

5. **Delivered** → Order has been delivered to customer

## Pages

### Dashboard

- Overview of key metrics
- Recent orders summary
- Quick statistics

### Orders

- Complete order management
- Status update buttons
- Order details and customer information
- Real-time order filtering

### Customers

- Customer database
- Order history per customer
- Customer statistics and contact information

## Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Vite** for build tooling

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Main application pages
│   ├── services/          # Business logic and API services
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application component
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Development

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update the navigation in `App.tsx`
2. **New Services**: Add to `src/services/` for business logic
3. **New Components**: Add to `src/components/` for reusable UI elements

### Real-time Features

To add new real-time features:

1. Use the `OrderSyncService` for order-related synchronization
2. Extend the `WebsiteConnectionService` for cross-origin communication
3. Add event listeners in components for real-time updates

## Deployment

1. Build the project:

```bash
npm run build
```

2. Deploy the `dist/` folder to your web server

3. Ensure both the main website and admin dashboard are on the same domain for full synchronization features

## Security Notes

- In production, implement proper authentication and authorization
- Add CORS protection and origin validation
- Use HTTPS for all communications
- Implement rate limiting and input validation
