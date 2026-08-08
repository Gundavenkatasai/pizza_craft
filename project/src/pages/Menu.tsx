import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { menuAPI } from '../services/api';
import { Pizza } from '../types';
import PizzaCard from '../components/PizzaCard';
import PizzaModal from '../components/PizzaModal';
import EmptyState from '../components/ui/EmptyState';

const Menu: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await menuAPI.getPizzas();
        // The API returns an array directly for normal users, but for admin it might return { data: ... }
        // Let's handle both just in case, but usually it's an array for normal fetching
        const rawData = Array.isArray(response) ? response : (response as any).data || [];
        
        // Map backend properties (snake_case) to frontend properties (camelCase)
        const mappedData = rawData.map((item: any) => {
          const cat = (item.category || '').toLowerCase();
          const isPizza = cat === 'pizzas' || cat === 'vegetarian' || cat === 'meat';
          const sizes = (!isPizza || !item.pizza_sizes || item.pizza_sizes.length === 0)
            ? [{ id: 'default', name: 'Regular', diameter: 'Standard', priceMultiplier: 1 }]
            : (item.pizza_sizes || item.sizes || []).map((s: any) => ({
                ...s,
                priceMultiplier: s.price_multiplier || s.priceMultiplier || 1
              }));
          return {
            ...item,
            id: item._id || item.id,
            basePrice: item.base_price || item.basePrice || 0,
            sizes
          };
        });
        
        setPizzas(mappedData);
      } catch (error) {
        console.error('Failed to fetch pizzas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  const categories = [
    { id: 'all', name: 'All Menu' },
    { id: 'pizzas', name: 'Pizzas' },
    { id: 'sides', name: 'Sides' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'desserts', name: 'Desserts' },
  ];

  const filteredItems = pizzas.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pc-surface">
      {/* Header */}
      <div className="pc-elevated border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold pc-text mb-4">
            Our Menu
          </h1>
          <p className="text-lg pc-text-secondary">
            Discover our handcrafted pizzas, sides, beverages, and delicious desserts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="pc-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 pc-text-muted h-5 w-5" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 pc-input"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                    selectedCategory === category.id
                      ? 'pc-btn-primary border-transparent'
                      : 'bg-transparent border-[var(--border)] pc-text hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="pc-text-secondary">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          /* Items Grid */
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <PizzaCard
                  key={item.id || (item as any)._id}
                  pizza={item}
                  onViewDetails={setSelectedPizza}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Filter}
              title="No items found"
              description="Try adjusting your search terms or filters"
            />
          )
        )}
      </div>

      {/* Pizza Modal */}
      {selectedPizza && (
        <PizzaModal
          pizza={selectedPizza}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </div>
  );
};

export default Menu;