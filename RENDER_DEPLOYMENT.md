# 🚀 Render Deployment Guide

## Overview

This guide covers deploying the PizzaCraft application to **Render** with:

- **Backend API** on Render Web Service
- **Frontend** on Render Static Site or Web Service
- **MongoDB Atlas** for database
- **Free tier** available

---

## Prerequisites

1. **GitHub Account** ✅ (Already set up)
2. **Render Account** - Sign up at https://render.com
3. **MongoDB Atlas Connection String** - From your existing cluster

Your MongoDB URI:

```
mongodb+srv://venkatasaigunda82_db_user:Lakshmisai%40321@cluster0.tlknxch.mongodb.net/?appName=Cluster0
```

---

## Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easier linking)
3. Authorize Render to access your GitHub account

---

## Step 2: Deploy Backend API

### Create Web Service for Backend

1. **In Render Dashboard**, click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select your `pizza_craft` repository from GitHub
   - Click **"Connect"**

3. **Configure Service**
   - **Name**: `pizza-craft-api`
   - **Root Directory**: `project/server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (optional: upgrade to paid for better performance)

4. **Set Environment Variables** (Click "Add from File" or add manually)

   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://venkatasaigunda82_db_user:Lakshmisai%40321@cluster0.tlknxch.mongodb.net/?appName=Cluster0
   JWT_SECRET=your-secure-jwt-secret-key-here
   FRONTEND_URL=https://pizza-craft-web.onrender.com,https://pizza-craft-admin.onrender.com
   RAZORPAY_KEY_ID=rzp_test_ODQ3lf6JSSFi9z
   RAZORPAY_KEY_SECRET=your-razorpay-secret-here
   STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
   ```

5. Click **"Create Web Service"**

6. **Wait for deployment** (2-5 minutes)
   - Copy the generated URL: `https://pizza-craft-api.onrender.com`
   - Save this for next steps

---

## Step 3: Deploy Frontend (Main Website)

### Create Web Service for Frontend

1. Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select `pizza_craft` repository
   - Click **"Connect"**

3. **Configure Service**
   - **Name**: `pizza-craft-web`
   - **Root Directory**: `project`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: `Free`

4. **Set Environment Variables**

   ```
   VITE_API_URL=https://pizza-craft-api.onrender.com
   NODE_ENV=production
   ```

5. Click **"Create Web Service"**

6. **Wait for deployment** (3-5 minutes)
   - Copy the generated URL: `https://pizza-craft-web.onrender.com`

---

## Step 4: Deploy Admin Dashboard

### Create Web Service for Admin

1. Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select `pizza_craft` repository
   - Click **"Connect"**

3. **Configure Service**
   - **Name**: `pizza-craft-admin`
   - **Root Directory**: `admin-dashboard`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: `Free`

4. **Set Environment Variables**

   ```
   VITE_BACKEND_URL=https://pizza-craft-api.onrender.com
   NODE_ENV=production
   ```

5. Click **"Create Web Service"**

6. **Wait for deployment** (2-4 minutes)
   - Copy the generated URL: `https://pizza-craft-admin.onrender.com`

---

## Step 5: Update CORS & Environment Variables

### Update Backend CORS

Since frontend URLs will change, update your backend environment:

1. Go to **pizza-craft-api** service
2. Click **"Settings"** → **"Environment Variables"**
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://pizza-craft-web.onrender.com,https://pizza-craft-admin.onrender.com
   ```
4. Click **"Save"** - Service will redeploy automatically

---

## 🔑 Login Credentials

### Admin Dashboard

- **Email**: `admin@pizzacraft.com`
- **Password**: `admin123`

### Customer Website

- **Email**: Any email (e.g., test@example.com)
- **Password**: Any password (min 6 characters)

---

## 📊 Deployed URLs

After all services are deployed:

| Service             | URL                                    |
| ------------------- | -------------------------------------- |
| **Main Website**    | https://pizza-craft-web.onrender.com   |
| **Admin Dashboard** | https://pizza-craft-admin.onrender.com |
| **Backend API**     | https://pizza-craft-api.onrender.com   |

---

## 🔧 Troubleshooting

### Service won't deploy

- Check **"Logs"** in Render dashboard
- Ensure all environment variables are set
- Verify `Root Directory` is correct

### CORS errors

- Update `FRONTEND_URL` in backend environment variables
- Wait 2-3 minutes for service to redeploy
- Clear browser cache (Ctrl+Shift+Delete)

### 404 errors on refresh

- Add custom headers for React Router:
  1. Go to service → **"Settings"**
  2. Scroll to **"Routes"** (if available)
  3. Set catch-all to serve `index.html`

### Database connection fails

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes Render IPs
  - Go to MongoDB Atlas → Network Access
  - Add `0.0.0.0/0` or Render's IP ranges

### Free tier limitations

- Services go to sleep after 15 mins of inactivity
- 400 hours/month runtime limit (shared)
- Upgrade to paid plan for 24/7 uptime

---

## 🔄 Auto-Deployment from GitHub

Render auto-deploys when you push to `main` branch:

```powershell
# Make changes and commit
git add .
git commit -m "Update production"
git push origin main

# Render will automatically redeploy all services
```

---

## 💰 Cost Breakdown

**Free Tier** (Recommended for testing):

- Backend: FREE
- Frontend: FREE
- Admin: FREE
- **Total**: $0/month

**Starter Plan** (Recommended for production):

- Each service: $7/month = $21/month total
- Plus MongoDB Atlas (free tier: $0)
- **Total**: ~$21/month

---

## Next Steps

1. ✅ Create Render account
2. ✅ Deploy Backend API
3. ✅ Deploy Frontend
4. ✅ Deploy Admin Dashboard
5. ✅ Test all services
6. ✅ Set up custom domain (optional)

**Estimated deployment time**: 15-20 minutes

For support: https://render.com/docs
