import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Bell, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Global Overview',
  '/global-orders': 'Global Orders',
  '/products': 'Products',
  '/users': 'User Management',
  '/settings': 'System Settings',
};

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Super Admin';

  const u = user as any;
  const initials = `${u?.first_name?.[0] || ''}${u?.last_name?.[0] || ''}`.toUpperCase() || 'SA';
  const displayName = u?.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u?.email || 'Super Admin';

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-16 border-b backdrop-blur-xl flex items-center justify-between px-6 md:px-8 sticky top-0 z-10"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', opacity: 0.9 }}
    >
      <div>
        <h2 className="text-base font-semibold pc-text">{title}</h2>
        <p className="text-xs pc-text-muted hidden md:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="theme-toggle p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 transition-colors rounded-lg pc-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:pc-text">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse border border-zinc-950" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20 shrink-0">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none pc-text">{displayName}</p>
            <p className="text-xs text-primary mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
