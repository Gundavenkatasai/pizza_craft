import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import { Plus, Search, Edit, Trash2, Tag, Percent, IndianRupee, Calendar } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res: any = await apiGet('/api/coupons');
        setCoupons(res.data || res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Coupons & Offers</h1>
          <p className="text-gray-500 mt-1">Manage promotional codes and discounts.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Validity</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No coupons found.</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const now = new Date();
                  const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < now;
                  const isActive = coupon.is_active && !isExpired;

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-mono font-bold tracking-widest border border-orange-200 uppercase">
                            {coupon.code}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-gray-600 capitalize">
                          {coupon.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                          {coupon.discount_type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-sm text-gray-600 gap-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> From: {formatDate(coupon.start_date)}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> To: {formatDate(coupon.expiry_date)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{coupon.usage_count || 0}</span>
                          <span className="text-gray-500"> / {coupon.usage_limit || '∞'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
