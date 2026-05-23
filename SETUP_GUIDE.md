# PizzaCraft Complete Setup Guide

## Quick Start

### Option 1: Using Batch Files (Windows)

1. **Start Main Pizza Website**: Double-click `start.bat`
   - Opens main website at `http://localhost:5173`
2. **Start Admin Dashboard**: Double-click `start-admin.bat`
   - Opens admin dashboard at `http://localhost:3001`

### Option 2: Manual Setup

#### Main Pizza Website

```bash
cd project
npm install
npm run dev
```

Access at: `http://localhost:5173`

#### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

Access at: `http://localhost:3001`

## Demo Credentials

### Customer Website (Main)

- Any email (e.g., vamsi@example.com)
- Any password
- Username will be extracted from email

### Admin Dashboard

- **Email**: admin@pizzacraft.com
- **Password**: admin123

## Features Implemented

### ✅ Fixed Issues

1. **Username Display**: Now shows actual login name (e.g., "Vamsi" from vamsi@example.com)
2. **View Details**: Order details page now opens properly with correct address
3. **Real-time Sync**: Admin updates reflect instantly on customer website

### ✅ Admin Dashboard Features

1. **Login/Signup**: Secure admin authentication
2. **Real-time Order Management**: Orders appear instantly from main website
3. **Status Updates**:
   - Pending → Confirmed → Preparing → Out for Delivery → Delivered
   - Updates reflect immediately on customer orders page
4. **Customer Management**: View all customers, order history, statistics
5. **Dashboard Analytics**: Revenue, order count, customer metrics
6. **Cross-domain Sync**: Real-time communication between websites

### ✅ Order Flow

1. Customer places order on main website → Appears in admin dashboard
2. Admin updates status → Customer sees update in real-time
3. Complete order tracking from placement to delivery

## Real-time Communication

The system uses multiple methods for real-time sync:

- **localStorage Events**: For same-origin communication
- **postMessage API**: For cross-origin communication
- **Custom Events**: For component-to-component updates
- **Storage Listeners**: For real-time data synchronization

## File Structure

```
pizza vamsi/
├── project/                 # Main pizza website
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OrderDetails.tsx  # Fixed: Now listens for admin updates
│   │   │   └── Orders.tsx        # Fixed: View Details works
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Fixed: Shows actual username
│   │   └── services/
│   │       └── auth.ts           # Fixed: Username extraction
│   └── package.json
├── admin-dashboard/         # New admin dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Admin authentication
│   │   │   ├── Dashboard.tsx     # Analytics & overview
│   │   │   ├── Orders.tsx        # Order management
│   │   │   └── Customers.tsx     # Customer management
│   │   ├── services/
│   │   │   ├── orderSync.ts      # Real-time order synchronization
│   │   │   └── websiteConnection.ts # Cross-domain communication
│   │   └── contexts/
│   │       └── AuthContext.tsx   # Admin auth context
│   └── package.json
├── start.bat               # Start main website (Windows)
├── start-admin.bat         # Start admin dashboard (Windows)
└── README.md              # This file
```

## Testing the Real-time Features

1. **Start both applications**
2. **Place an order** on main website (localhost:5173)
3. **Login to admin** dashboard (localhost:3001)
4. **See order appear** instantly in admin dashboard
5. **Update order status** in admin dashboard
6. **Check customer orders page** - status updated in real-time

## Additional Features Added

### Admin Dashboard Extras

- **Customer Analytics**: Total spent, order frequency
- **Revenue Tracking**: Real-time revenue calculations
- **Order Filtering**: Filter by status (pending, preparing, etc.)
- **Responsive Design**: Works on mobile and desktop
- **Toast Notifications**: Success/error feedback
- **Auto-refresh**: Real-time data updates

### Security Features

- Admin authentication
- Input validation
- Error handling
- Cross-origin security considerations

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in vite.config.ts if needed
2. **Dependencies**: Run `npm install` in both directories
3. **Real-time sync not working**: Ensure both apps are running
4. **Login issues**: Use exact credentials provided above

### Reset Data

To reset all orders and start fresh:

```javascript
// Run in browser console on either website
localStorage.clear();
location.reload();
```

## Future Enhancements

The system is designed to easily add:

- WebSocket connections for enhanced real-time features
- Database integration
- Push notifications
- Advanced analytics
- Multi-admin support
- Order assignment and routing
- Kitchen display system integration

## Support

For issues or questions, check the browser console for error messages and ensure both applications are running on their respective ports.

## Secrets & Git (Important)

Keep API keys, database URIs, and credentials out of source control. Follow these steps to secure secrets before pushing to GitHub:

- Create a local `.env` file from `project/.env.example` and fill real values. Do NOT commit `.env`.

- Ensure `.gitignore` contains the following (already added):
  - `.env`, `.env.*`, `node_modules/`, `.vscode/`, build folders

- Use environment variables in code (already used in this project) via `process.env.<NAME>`.

- For CI / deployment (GitHub Actions, Vercel, Netlify, etc.) use provider secrets/environment settings to inject variables at runtime.

- If you accidentally committed secrets:
  1.  Remove the file from Git history locally: `git rm --cached .env` and commit.

2.  To scrub history use a tool like `git filter-repo` or `BFG Repo-Cleaner` (example):

```powershell
# Remove a file from history (BFG example)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

- Rotate any compromised keys immediately (create new DB user, regenerate API keys).

- For GitHub repositories, add secrets via the repository Settings → Secrets → Actions / Codespaces / Dependabot.

If you want, I can: scan the repository for likely secrets, add `.env` templates for other folders (like `admin-dashboard`), and provide step-by-step commands to remove any accidentally committed keys from history. Which would you like me to do next?

### Optional: Install local git hooks to block secrets

You can enable a repository-held pre-commit hook that scans staged files for obvious secrets. I added a scanner and hook in the repo, but you must enable hooks locally:

```powershell
# Enable hooks stored in the repository
git config core.hooksPath .githooks

# Make sure the hook is executable (Git Bash / WSL)
chmod +x .githooks/pre-commit

# Test by staging a .env file and trying to commit (should be blocked)
```

Notes:

- The scanner is conservative and looks for common patterns (MongoDB URIs, API keys, private key blocks, Razorpay prefixes, etc.). If it blocks a false-positive you can inspect the output and fix the file or bypass temporarily with `git commit --no-verify`.
- This approach requires each developer to run the `git config` command once on their machine. If you want hooks enforced for CI or org-wide, consider using server-side checks or CI jobs that fail on secrets.
