import React from 'react';
import { Menu, Bell, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="pc-glass border-b sticky top-0 z-30" style={{ borderColor: 'var(--border)' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl pc-text-secondary hover:bg-[var(--bg-hover)] transition-colors mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold pc-text hidden sm:block">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="theme-toggle p-2 rounded-full pc-text-secondary hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 rounded-full pc-text-secondary hover:bg-orange-500/10 hover:text-orange-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-surface)]"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px]">
                <div className="w-full h-full bg-[var(--bg-surface)] rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 pc-text-muted" />
                  )}
                </div>
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium pc-text">{user?.firstName || 'Admin'}</p>
                <p className="pc-text-muted text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
