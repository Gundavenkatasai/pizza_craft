import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../services/api';
import { AnimatedCard } from '../components/AnimatedCard';
import { Users as UsersIcon, Search, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await apiGet(`/api/admin/users?page=${page}&limit=20&search=${search}`);
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiPut(`/api/admin/users/${userId}/role`, { role: newRole });
      showToast('Role updated successfully', 'success');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) {
      showToast(e.message || 'Failed to update role', 'error');
    }
  };

  const roleColors: Record<string, string> = {
    'super_admin': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'admin': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'customer': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'staff': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'manager': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'restaurant_admin': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            User Management <UsersIcon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-gray-400 mt-2">Manage roles and permissions across the platform.</p>
        </div>
      </motion.div>

      <AnimatedCard>
        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-sm">
                <th className="py-4 px-4 font-medium uppercase tracking-wider">User</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Joined</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Role</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{user.email}</td>
                    <td className="py-4 px-4 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.role] || roleColors['customer']}`}>
                        {user.role === 'super_admin' ? <ShieldAlert className="w-3 h-3" /> : user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 ml-auto outline-none cursor-pointer hover:border-gray-500 transition-colors"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="restaurant_admin">Restaurant Admin</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-gray-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
