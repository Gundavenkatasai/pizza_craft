import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import { Plus, Edit, Trash2, LayoutGrid, Image as ImageIcon } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await apiGet('/api/categories');
        setCategories(res.data || res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your menu items into categories.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Create categories to organize your menu items.</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any, idx: number) => {
            // categories might be just strings from distinct('category') for now if Category model not fully populated yet
            const isString = typeof category === 'string';
            const name = isString ? category : category.name;
            const desc = isString ? 'Menu category' : category.description;
            const image = isString ? null : category.image;
            const isActive = isString ? true : category.is_active;

            return (
              <div key={idx} className="glass-card group overflow-hidden">
                <div className="h-32 bg-gray-100 relative">
                  {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-rose-50 flex items-center justify-center">
                      <LayoutGrid className="w-10 h-10 text-orange-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white transition-colors shadow-sm">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-lg text-rose-600 hover:bg-white transition-colors shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                    {isActive !== false ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shadow-sm shadow-emerald-500/50"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300 mt-2"></span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{desc || 'No description provided.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
