import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ShoppingBag,
  Globe,
  Pizza,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/global-orders', icon: ShoppingBag, label: 'Global Orders' },
  { to: '/products', icon: Pizza, label: 'Products' },
  { to: '/users', icon: Users, label: 'User Management' },
  { to: '/settings', icon: Settings, label: 'System Settings' },
];

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-64 min-h-screen hidden md:flex flex-col shrink-0 border-r"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <Globe className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none pc-text">Super Admin</h1>
          <p className="text-xs mt-0.5 pc-text-muted">PizzaCraft Platform</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={() =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'pc-elevated pc-text shadow-inner'
                    : 'pc-text-muted hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:pc-text'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
              {isActive && (
                <motion.div layoutId="activePill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl pc-elevated">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-violet-600/60 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(user as any)?.first_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate pc-text">{(user as any)?.first_name} {(user as any)?.last_name}</p>
            <p className="text-xs flex items-center gap-1 pc-text-muted">
              <ShieldAlert className="w-3 h-3 text-primary" /> Super Admin
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl transition-all text-sm border border-transparent pc-text-muted hover:text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};
