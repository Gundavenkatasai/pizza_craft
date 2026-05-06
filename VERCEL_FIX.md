# Vercel Serverless Function Fix - Updated

## Latest Problem (Still Crashing)

The function is still crashing because Vercel serverless has specific requirements for Express apps and module resolution.

## Root Cause

1. Socket.IO server creation with `http.createServer()` doesn't work in serverless
2. `server.listen()` attempts crash in serverless environment
3. Module dependencies may not be properly resolved
4. Static file serving paths might be incorrect in serverless context

## Solution Applied

### 1. **Removed Socket.IO from Serverless**

Socket.IO requires persistent connections which don't work in Vercel serverless. Options:

- **Option A**: Remove real-time features for Vercel deployment
- **Option B**: Deploy to Railway/Render for WebSocket support
- **Option C**: Use Vercel Edge Functions (requires rewrite)

### 2. **Fixed Module Structure**

- Ensured `project/server/index.js` exports the Express app
- Removed unnecessary `api/` wrapper directory
- Used proper Vercel detection: `process.env.VERCEL === '1'`

### 3. **Configuration Files**

- `.vercelignore` - Ensures dist folders are included
- `vercel.json` - Proper routing configuration
- Root `package.json` - Unified build command

## Required Vercel Settings

### Environment Variables (CRITICAL - CHECK THESE FIRST!)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_long_random_secret_key
NODE_ENV=production
```

Optional but recommended:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
VITE_GEMINI_API_KEY=xxx
VITE_WEATHER_API_KEY=xxx
```

### Build Settings in Vercel Dashboard

- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty or `project/dist`
- **Install Command**: `npm install && cd project/server && npm install`
- **Node Version**: 18.x or 20.x

## Debugging Steps

### 1. Check Vercel Function Logs

```
Vercel Dashboard → Your Project → Deployments → Latest → Functions Tab → Click function → View logs
```

Look for:

- "Cannot find module" errors → Missing dependencies
- "MONGODB_URI not set" → Missing env variables
- "EADDRINUSE" or "server.listen" errors → Serverless compatibility issue

### 2. Test Locally First

```powershell
# Set environment variables
$env:NODE_ENV="production"
$env:VERCEL="1"
$env:MONGODB_URI="your_connection_string"

# Start server
npm start
```

Should start WITHOUT calling `server.listen()` when VERCEL=1

### 3. Common Fixes

**Missing Dependencies:**

```powershell
cd project/server
npm install
cd ../..
git add project/server/package-lock.json
git commit -m "fix: Add server dependencies lockfile"
git push
```

**Wrong Node Version:**
Add to `package.json`:

```json
"engines": {
  "node": "18.x"
}
```

**Module Resolution Issues:**
Ensure all imports use `.js` extensions:

```javascript
import { something } from "./file.js"; // ✅ Good
import { something } from "./file"; // ❌ Bad in ESM
```

## Alternative: Railway Deployment (Recommended for This App)

Since this app uses Socket.IO heavily, consider Railway:

```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

Benefits:

- Full WebSocket support
- Persistent connections
- Real-time features work
- Simpler configuration
- Free tier available

## Quick Rollback

If deployment keeps failing:

1. Go to Vercel Dashboard
2. Deployments tab
3. Find last working deployment
4. Click "..." → "Promote to Production"

## Need Help?

Check these in order:

1. ✅ All environment variables set in Vercel?
2. ✅ MongoDB URI is correct and accessible?
3. ✅ Build logs show successful build?
4. ✅ Function logs show what error?
5. ✅ Local test with VERCEL=1 works?

If all else fails, the app architecture requires persistent WebSocket connections → Deploy to Railway/Render instead of Vercel.
