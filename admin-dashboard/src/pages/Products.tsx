import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import { Search, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res: any = await apiGet(`/api/menu/pizzas?admin=true&page=${page}&limit=10&search=${searchTerm}`);
      if (res && res.data) {
        setProducts(res.data);
        setTotalPages(res.totalPages);
      } else {
        setProducts(res as any || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold pc-text tracking-tight">Products</h1>
          <p className="pc-text-muted mt-1">View your menu items, categories, and inventory.</p>
        </div>
      </div>

      <div className="pc-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-elevated)]">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pc-text-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 pc-input focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-elevated)] pc-text-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center pc-text-muted">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center pc-text-muted">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border)] flex-shrink-0">
                          {product.image || product.images?.[0] ? (
                            <img 
                              src={product.image || product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 pc-text-muted" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold pc-text">{product.name}</p>
                          <p className="text-xs pc-text-muted truncate w-48">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-elevated)] pc-text">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 font-medium pc-text">
                      ₹{product.base_price || product.price || 0}
                    </td>
                    <td className="p-4">
                      {product.available ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {product.stock === -1 ? (
                        <span className="text-emerald-500 font-medium text-sm">Unlimited</span>
                      ) : product.stock > 10 ? (
                        <span className="pc-text font-medium text-sm">{product.stock} in stock</span>
                      ) : (
                        <span className="text-rose-500 font-medium text-sm">{product.stock} low stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <p className="text-sm pc-text-muted">
            Showing page <span className="font-medium pc-text">{page}</span> of <span className="font-medium pc-text">{totalPages || 1}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-[var(--border)] pc-text-secondary hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-[var(--border)] pc-text-secondary hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
