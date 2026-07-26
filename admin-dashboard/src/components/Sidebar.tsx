import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  Ticket,
  Settings as SettingsIcon,
  X,
  PieChart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['admin', 'staff', 'super_admin', 'restaurant_admin', 'manager', 'kitchen_staff', 'delivery_staff'] },
    { name: 'Orders', to: '/orders', icon: ShoppingBag, roles: ['admin', 'staff', 'super_admin', 'restaurant_admin', 'manager', 'kitchen_staff', 'delivery_staff'] },
    { name: 'Categories', to: '/categories', icon: Tags, roles: ['admin', 'super_admin', 'restaurant_admin', 'manager'] },
    { name: 'Inventory', to: '/inventory', icon: PieChart, roles: ['admin', 'super_admin', 'restaurant_admin', 'manager', 'kitchen_staff'] },
    { name: 'Coupons', to: '/coupons', icon: Ticket, roles: ['admin', 'super_admin', 'restaurant_admin', 'manager'] },
    { name: 'Settings', to: '/settings', icon: SettingsIcon, roles: ['admin', 'super_admin', 'restaurant_admin'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role || ''));

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-opacity"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 pc-surface backdrop-blur-xl border-r shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-400">
                PizzaCraft
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg transition-colors pc-text-muted hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-white shadow-md shadow-orange-500/20" 
                    : "pc-text-muted hover:pc-text hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 opacity-100 transition-opacity" />
                    )}
                    <item.icon className={clsx("w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "pc-text-muted group-hover:text-orange-500")} />
                    <span className="relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="rounded-xl p-4 mb-4 pc-elevated">
              <div className="text-sm font-medium truncate pc-text">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs capitalize mt-1 pc-text-muted">
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
