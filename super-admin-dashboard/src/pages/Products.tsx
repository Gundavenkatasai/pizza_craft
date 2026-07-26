import React, { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';
import { AnimatedCard } from '../components/AnimatedCard';
import { Pizza, Plus, Search, Pencil, Trash2, X, ToggleLeft, ToggleRight, Star, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';

const BASE_URL = (import.meta as any)?.env?.VITE_BACKEND_URL || 'http://localhost:3001';
const MAIN_SITE = 'http://localhost:5173';

// Resolve image: could be full URL, relative /products/..., or empty
function resolveImage(img: string | undefined): string | null {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  // Relative path — served by the main frontend static server
  return `${MAIN_SITE}${img}`;
}

const PIZZA_EMOJI_MAP: Record<string, string> = {
  'margherita': '🍕', 'pepperoni': '🍖', 'bbq': '🔥', 'hawaiian': '🍍',
  'meat': '🥩', 'veggie': '🥦', 'mushroom': '🍄', 'cheese': '🧀',
  'chicken': '🍗', 'paneer': '🧀', 'buffalo': '🌶️', 'truffle': '✨',
};

function getPizzaEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(PIZZA_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍕';
}

const EMPTY_FORM = {
  name: '', description: '', image: '', base_price: '', category: 'Pizzas',
  ingredients: '', available: true, featured: false, popular: false,
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch categories from real DB
  useEffect(() => {
    apiGet<string[]>('/api/menu/categories').then(cats => {
      setCategories(['All', ...cats]);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: 'true', page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      const res: any = await apiGet(`/api/menu/pizzas?${params}`);
      setProducts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      showToast(e.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, category: categories[1] || 'Pizzas' });
    setEditProduct(null);
    setShowModal(true);
  };
  const openEdit = (p: any) => {
    setForm({
      name: p.name || '', description: p.description || '', image: p.image || '',
      base_price: p.base_price || '', category: p.category || 'Pizzas',
      ingredients: (p.ingredients || []).join(', '), available: p.available !== false,
      featured: p.featured || false, popular: p.popular || false,
    });
    setEditProduct(p);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm(f => ({ ...f, [target.name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        base_price: parseFloat(String(form.base_price)),
        ingredients: form.ingredients ? form.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      };
      if (editProduct) {
        const updated = await apiPut(`/api/menu/pizzas/${editProduct._id}`, payload);
        setProducts(prev => prev.map(p => p._id === editProduct._id ? updated : p));
        showToast('Product updated!', 'success');
      } else {
        const created: any = await apiPost('/api/menu/pizzas', { ...payload, basePrice: payload.base_price });
        setProducts(prev => [created, ...prev]);
        setTotal(t => t + 1);
        showToast('Product created!', 'success');
      }
      closeModal();
    } catch (e: any) {
      showToast(e.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    setDeletingId(id);
    try {
      await apiDelete(`/api/menu/pizzas/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      setTotal(t => t - 1);
      showToast('Product deleted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (p: any) => {
    try {
      const updated: any = await apiPut(`/api/menu/pizzas/${p._id}`, { available: !p.available });
      setProducts(prev => prev.map(x => x._id === p._id ? { ...x, available: updated.available } : x));
      showToast(`${p.name} is now ${updated.available ? 'available' : 'unavailable'}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to toggle', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Products <Pizza className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-gray-400 mt-2">{total} products on the platform</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </motion.div>

      <AnimatedCard>
        {/* Search + Category filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text" placeholder="Search products..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <button onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 transition-all text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🍕</div>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try changing the search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p, i) => {
              const imgSrc = resolveImage(p.image) || resolveImage(p.images?.[0]);
              const emoji = getPizzaEmoji(p.name);
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`group bg-zinc-900 rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 ${
                    p.available ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/40 opacity-55'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => {
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl select-none">${emoji}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl select-none">{emoji}</div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      {!p.available && (
                        <span className="bg-zinc-800/90 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">Disabled</span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1.5 flex-col items-end">
                      {p.featured && (
                        <span className="bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                          <Star className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                      {p.popular && (
                        <span className="bg-rose-500/90 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">🔥 Popular</span>
                      )}
                    </div>

                    {/* Hover overlay with quick actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(p)} className="p-2.5 rounded-xl bg-blue-500/80 text-white hover:bg-blue-500 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleAvailable(p)} className="p-2.5 rounded-xl bg-zinc-700/80 text-white hover:bg-zinc-600 transition-colors" title="Toggle availability">
                        {p.available ? <ToggleRight className="w-4 h-4 text-emerald-300" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                        className="p-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-colors disabled:opacity-50" title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-white font-bold text-sm leading-tight truncate">{p.name}</h3>
                      <span className="text-primary font-bold text-sm shrink-0">₹{p.base_price}</span>
                    </div>
                    <span className="inline-block text-xs text-gray-500 bg-zinc-800 px-2 py-0.5 rounded-full mb-2">{p.category}</span>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{p.description}</p>
                    {p.ingredients?.length > 0 && (
                      <p className="text-gray-600 text-xs mt-2 truncate">🧂 {p.ingredients.slice(0, 3).join(', ')}{p.ingredients.length > 3 ? '...' : ''}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >← Previous</button>
            <span className="text-gray-400 text-sm">Page <span className="text-white font-medium">{page}</span> of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >Next →</button>
          </div>
        )}
      </AnimatedCard>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                <h2 className="text-xl font-bold text-white">{editProduct ? `Edit: ${editProduct.name}` : '➕ Add New Product'}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} required placeholder="e.g. Margherita Pizza"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Base Price (₹) *</label>
                    <input name="base_price" value={form.base_price} onChange={handleFormChange} required type="number" min="0" placeholder="299"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
                    <select name="category" value={form.category} onChange={handleFormChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Image URL</label>
                  <input name="image" value={form.image} onChange={handleFormChange} placeholder="https://example.com/pizza.jpg"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  {form.image && (
                    <div className="mt-2 h-24 w-full rounded-lg overflow-hidden bg-zinc-800">
                      <img src={resolveImage(form.image) || ''} alt="preview" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} required rows={3} placeholder="Describe the product..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Ingredients (comma-separated)</label>
                  <input name="ingredients" value={form.ingredients} onChange={handleFormChange} placeholder="Cheese, Tomato, Basil"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex gap-6 pt-1">
                  {['available', 'featured', 'popular'].map(field => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" name={field} checked={(form as any)[field]} onChange={handleFormChange}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-gray-300 capitalize">{field}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-zinc-700 text-gray-300 hover:text-white hover:border-zinc-500 transition-all text-sm font-medium"
                  >Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
