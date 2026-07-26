import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import { Search, Mail, Phone, MapPin, User, Calendar, ExternalLink } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Since there is no explicit customers endpoint yet, we could fetch from admin/users or just use placeholder logic
        // We'll mock it for now or rely on a future endpoint
        const res: any = await apiGet('/api/auth/users').catch(() => ({ data: [] }));
        if (res && res.data) {
          setCustomers(res.data);
        } else if (Array.isArray(res)) {
          setCustomers(res);
        } else {
          // Fallback dummy data if no endpoint
          setCustomers([
            { _id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '9876543210', role: 'customer', created_at: new Date().toISOString() },
            { _id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', phone: '9876543211', role: 'customer', created_at: new Date(Date.now() - 86400000).toISOString() }
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    (c.first_name + ' ' + c.last_name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer base and view their order history.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No customers found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px] flex-shrink-0">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-orange-500 font-bold uppercase overflow-hidden">
                            {customer.avatar ? <img src={customer.avatar} alt="Avatar" className="w-full h-full object-cover"/> : (customer.first_name?.[0] || 'C')}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
                          <p className="text-xs text-gray-500">ID: {customer._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                        customer.role === 'customer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        customer.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {customer.role?.replace('_', ' ') || 'customer'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(customer.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                          <ExternalLink className="w-4 h-4" /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
