# ⚡ 3-MINUTE DEPLOYMENT GUIDE FOR RENDER

## STEP 1: Login to Render (1 minute)
1. Go to: https://dashboard.render.com
2. Click **"GitHub"** button
3. Authorize Render → Done! ✅

## STEP 2: Deploy Backend (1 minute)
1. Click **"New +"** → **"Web Service"**
2. Select: **pizza_craft**
3. Copy-paste these settings:

```
Name:            pizza-craft-api
Root Directory:  project/server
Runtime:         Node
Build Command:   npm install
Start Command:   npm start
Plan:            Free
```

4. Click **"Advanced"** or scroll to **"Environment"**
5. Add these variables:
```
PORT                 = 3001
NODE_ENV             = production
MONGODB_URI          = mongodb+srv://venkatasaigunda82_db_user:Lakshmisai%40321@cluster0.tlknxch.mongodb.net/?appName=Cluster0
JWT_SECRET           = pizza-craft-jwt-prod-2025
RAZORPAY_KEY_ID      = rzp_test_ODQ3lf6JSSFi9z
RAZORPAY_KEY_SECRET  = EI21xvagP5DUVcGEl1xtS8AK
FRONTEND_URL         = https://pizza-craft-web.onrender.com,https://pizza-craft-admin.onrender.com
```

6. Click **"Create Web Service"**
7. ⏳ Wait 3-5 minutes for deployment
8. Copy the URL shown (e.g., `https://pizza-craft-api.onrender.com`)

## STEP 3: Deploy Frontend (1 minute)
1. Click **"New +"** → **"Web Service"**
2. Select: **pizza_craft**
3. Copy-paste these settings:

```
Name:            pizza-craft-web
Root Directory:  project
Runtime:         Node
Build Command:   npm install && npm run build
Start Command:   npm run preview
Plan:            Free
```

4. Add these variables:
```
VITE_API_URL  = https://pizza-craft-api.onrender.com
NODE_ENV      = production
```

5. Click **"Create Web Service"**
6. ⏳ Wait 3-5 minutes

## STEP 4: Deploy Admin (1 minute)
1. Click **"New +"** → **"Web Service"**
2. Select: **pizza_craft**
3. Copy-paste these settings:

```
Name:            pizza-craft-admin
Root Directory:  admin-dashboard
Runtime:         Node
Build Command:   npm install && npm run build
Start Command:   npm run preview
Plan:            Free
```

4. Add these variables:
```
VITE_BACKEND_URL  = https://pizza-craft-api.onrender.com
NODE_ENV          = production
```

5. Click **"Create Web Service"**
6. ⏳ Wait 3-5 minutes

---

## ✅ YOUR DEPLOYED LINKS

After all 3 deploy:
- **Main Website**: https://pizza-craft-web.onrender.com
- **Admin Dashboard**: https://pizza-craft-admin.onrender.com  
- **Backend API**: https://pizza-craft-api.onrender.com

## 🔑 LOGIN CREDENTIALS

**Admin Panel:**
```
Email: admin@pizzacraft.com
Password: admin123
```

**Customer Website:**
```
Any email (test@example.com)
Any password (min 6 chars)
```

---

## 🐛 If something fails:

1. Check service **"Logs"** in Render
2. Common fixes:
   - Clear env var → Redeploy automatically
   - Wrong Root Directory → Update settings
   - Build fails → Check Node version (needs 18+)

---

**Total time: ~3 minutes + 15-20 min waiting for deployments = ~23 minutes total** ⏱️
