# 🚀 QUICK DEPLOYMENT CHECKLIST

## ✅ What's Been Done

- ✅ Code pushed to GitHub: https://github.com/Gundavenkatasai/pizza_craft.git
- ✅ CORS configuration fixed
- ✅ Admin user created (admin@pizzacraft.com / admin123)
- ✅ MongoDB connection verified
- ✅ Deployment guides created
- ✅ All services tested locally

---

## 📋 YOUR NEXT STEPS (15 minutes to deploy!)

### Step 1: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click **"Sign up"** → Sign up with GitHub
3. Authorize Render to access your GitHub
4. **You're ready!**

### Step 2: Deploy Backend API (5 minutes)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. **Select repository**: pizza_craft
3. **Name**: `pizza-craft-api`
4. **Root Directory**: `project/server`
5. **Runtime**: Node
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. **Add Environment Variables** (copy from below):
   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://venkatasaigunda82_db_user:Lakshmisai%40321@cluster0.tlknxch.mongodb.net/?appName=Cluster0
   JWT_SECRET=pizza-craft-jwt-secret-production-2025
   RAZORPAY_KEY_ID=rzp_test_ODQ3lf6JSSFi9z
   RAZORPAY_KEY_SECRET=EI21xvagP5DUVcGEl1xtS8AK
   ```
9. Click **"Create Web Service"**
10. **Wait 3-5 minutes** for deployment ⏳
11. **Copy the URL** (you'll need it next)

### Step 3: Deploy Frontend (Main Website) (4 minutes)

1. Click **"New +"** → **"Web Service"**
2. **Select repository**: pizza_craft
3. **Name**: `pizza-craft-web`
4. **Root Directory**: `project`
5. **Runtime**: Node
6. **Build Command**: `npm install && npm run build`
7. **Start Command**: `npm run preview`
8. **Add Environment Variables**:
   ```
   VITE_API_URL=https://pizza-craft-api.onrender.com
   NODE_ENV=production
   ```
9. Click **"Create Web Service"**
10. **Wait 3-5 minutes** ⏳

### Step 4: Deploy Admin Dashboard (4 minutes)

1. Click **"New +"** → **"Web Service"**
2. **Select repository**: pizza_craft
3. **Name**: `pizza-craft-admin`
4. **Root Directory**: `admin-dashboard`
5. **Runtime**: Node
6. **Build Command**: `npm install && npm run build`
7. **Start Command**: `npm run preview`
8. **Add Environment Variables**:
   ```
   VITE_BACKEND_URL=https://pizza-craft-api.onrender.com
   NODE_ENV=production
   ```
9. Click **"Create Web Service"**
10. **Wait 3-5 minutes** ⏳

---

## 🎯 After Deployment

Your live URLs will be:

- **Main Website**: https://pizza-craft-web.onrender.com
- **Admin Dashboard**: https://pizza-craft-admin.onrender.com
- **Backend API**: https://pizza-craft-api.onrender.com

### Test Login

- **Admin Email**: admin@pizzacraft.com
- **Admin Password**: admin123

### Test Signup

- Any email (e.g., test@example.com)
- Any password (min 6 characters)

---

## 🔧 If Something Goes Wrong

**Check Render Logs:**

1. Go to your service in Render
2. Click **"Logs"** tab
3. Look for error messages
4. Common issues:
   - ❌ Build command failed → Check Root Directory
   - ❌ Cannot connect to DB → Check MONGODB_URI
   - ❌ CORS errors → Update FRONTEND_URL in backend env vars
   - ❌ 404 errors → Try different Start Command

**Quick Fixes:**

- Update environment variables → Service auto-redeploys
- Change build/start command → Redeploy manually
- Environment issues → Clear browser cache (Ctrl+Shift+Delete)

---

## 📖 Full Deployment Guide

For detailed instructions, see: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

## 💡 Tips

- **Free tier** = Services sleep after 15 mins of inactivity (perfect for testing)
- **Auto-deploy** = Every `git push origin main` triggers redeploy
- **Need 24/7?** = Upgrade to Starter Plan ($7/service/month)
- **Custom domain?** = Add in Render settings after deployment

---

## 📞 Support

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Still need help? Ask me!

---

**You're all set! Start with Step 1 and follow through Step 4. Total time: ~15 minutes** ⏱️
