import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pizza, ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAppNavigation } from '../hooks/useAppNavigation';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { goHome, goToCart } = useAppNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      goHome();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b pc-glass" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
            <Pizza className="h-8 w-8 text-orange-500" />
            <span className="font-display font-bold text-xl pc-text">PizzaCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/menu" className="pc-text-secondary hover:text-orange-500 font-medium transition-colors">
              Menu
            </Link>
            {user && (
              <Link to="/orders" className="pc-text-secondary hover:text-orange-500 font-medium transition-colors">
                Orders
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="pc-text-secondary hover:text-orange-500 font-medium transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="theme-toggle transition-all"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )}
            </button>

            <button 
              onClick={goToCart} 
              className="relative p-2 pc-text-secondary hover:text-orange-500 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="pc-text-secondary hover:text-orange-500 font-medium transition-colors">
                  {user.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="pc-btn-primary px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="theme-toggle transition-all"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 pc-text-secondary hover:text-orange-500 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t pc-glass absolute w-full left-0 px-4 shadow-lg top-[100%]" style={{ borderColor: 'var(--border)' }}>
            <nav className="flex flex-col space-y-4">
              <Link
                to="/menu"
                className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                onClick={handleLinkClick}
              >
                Menu
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                  onClick={handleLinkClick}
                >
                  Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                  onClick={handleLinkClick}
                >
                  Admin
                </Link>
              )}
              
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link
                  to="/cart"
                  className="flex items-center space-x-2 pc-text-secondary hover:text-orange-500 font-medium transition-colors mb-4"
                  onClick={handleLinkClick}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart ({itemCount})</span>
                </Link>

                {user ? (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/profile"
                      className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                      onClick={handleLinkClick}
                    >
                      {user.firstName} (Profile)
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="pc-text-secondary hover:text-orange-500 font-medium transition-colors"
                      onClick={handleLinkClick}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="pc-btn-primary px-4 py-2 text-center"
                      onClick={handleLinkClick}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;