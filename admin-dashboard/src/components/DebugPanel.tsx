import React, { useState, useEffect } from 'react';

const DebugPanel: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [supabaseStatus, setSupabaseStatus] = useState<string>('checking');

  useEffect(() => {
    const checkOrders = () => {
      const mainOrders = localStorage.getItem('orders');
      const adminOrdersData = localStorage.getItem('pizzacraft_orders');
      const timestamp = localStorage.getItem('orders_timestamp');
      
      const mainOrdersArray = mainOrders ? JSON.parse(mainOrders) : [];
      const adminOrdersArray = adminOrdersData ? JSON.parse(adminOrdersData) : [];
      
      console.log('Debug Panel Check:', {
        mainOrders: mainOrdersArray.length,
        adminOrders: adminOrdersArray.length,
        timestamp: timestamp,
        mainOrdersRaw: mainOrders?.slice(0, 100) + '...',
        adminOrdersRaw: adminOrdersData?.slice(0, 100) + '...'
      });
      
      setOrders(mainOrdersArray);
      setAdminOrders(adminOrdersArray);
      setLastUpdate(new Date().toLocaleTimeString());
    };

    const checkSupabaseConnection = () => {
      // Supabase removed - using MongoDB backend
      setSupabaseStatus('MongoDB (Not using Supabase)');
    };

    // Initial checks
    checkOrders();
    checkSupabaseConnection();

    // Set up interval to check every second
    const interval = setInterval(checkOrders, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const forceSync = async () => {
    console.log('Force sync triggered');
    window.dispatchEvent(new CustomEvent('force-refetch-orders'));
  };

  const testApi = async () => {
    console.log('Testing backend API connection...');
    try {
      const response = await fetch('https://pizza-craft-0aov.onrender.com/api/health');
      if (response.ok) {
        alert('Backend API connection successful!');
      } else {
        alert('Backend API connection failed: ' + response.status);
      }
    } catch (error) {
      alert('Backend API connection failed: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug Panel - Real-time Sync Status</h3>
      <div className="text-sm text-yellow-700 space-y-2">
        <p><strong>Last Update:</strong> {lastUpdate}</p>
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
            <span className="text-xs">
              Backend: {supabaseStatus}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Main Website Orders:</strong> {orders.length}</p>
            {orders.length > 0 && (
              <p className="text-xs">Latest: {orders[0]?.id?.slice(-6) || 'N/A'}</p>
            )}
          </div>
          <div>
            <p><strong>Admin Dashboard Orders:</strong> {adminOrders.length}</p>
            {adminOrders.length > 0 && (
              <p className="text-xs">Latest: {adminOrders[0]?.id?.slice(-6) || 'N/A'}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${orders.length === adminOrders.length ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">
            {orders.length === adminOrders.length ? 'Synced' : 'Out of Sync'}
          </span>
          <button 
            onClick={forceSync}
            className="ml-4 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Force Sync
          </button>
          <button 
            onClick={testApi}
            className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Test API
          </button>
        </div>
        
        {orders.length > 0 && (
          <div className="mt-2">
            <p><strong>Latest Order:</strong></p>
            <pre className="bg-yellow-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(orders[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
