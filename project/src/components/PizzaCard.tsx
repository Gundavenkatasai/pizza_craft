import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Pizza } from '../types';
import { useCart } from '../contexts/CartContext';
import { formatCurrency, calculatePizzaPrice } from '../utils/currency';

interface PizzaCardProps {
  pizza: Pizza;
  onViewDetails: (pizza: Pizza) => void;
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, onViewDetails }) => {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For non-pizzas that don't have sizes, provide a default "regular" size
    const availableSizes = (pizza.sizes && pizza.sizes.length > 0) 
      ? pizza.sizes 
      : [{ id: 'default', name: 'regular' as any, diameter: '', priceMultiplier: 1 }];
      
    const selectedSize = availableSizes.find(size => size.name === 'medium') || availableSizes[0];
    
    if (selectedSize) {
      addItem(pizza, selectedSize, 1);
    }
  };

  const isPizza = pizza.category?.toLowerCase() === 'pizzas' || pizza.category?.toLowerCase() === 'vegetarian' || pizza.category?.toLowerCase() === 'meat';
  
  const availableSizes = (pizza.sizes && pizza.sizes.length > 0) ? pizza.sizes : null;
  const selectedSize = availableSizes 
    ? (availableSizes.find(s => s.name === 'small') || availableSizes[0])
    : null;
    
  const sizeKey = (selectedSize?.name || '').toLowerCase();
  
  let computed = pizza.basePrice * (selectedSize?.priceMultiplier || 1);
  if (isPizza) {
    computed = calculatePizzaPrice(pizza.basePrice * (selectedSize?.priceMultiplier || 1), pizza.ingredients?.length || 0, sizeKey);
  } else {
    // For non-pizzas, just use base price * multiplier
    computed = pizza.basePrice * (selectedSize?.priceMultiplier || 1);
  }
                  
  const displayUnit = Math.round(computed * 100) / 100;

  return (
    <div 
      className="pc-card overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 group transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onViewDetails(pizza)}
    >
      <div className="relative">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80';
          }}
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleQuickAdd}
            className="pc-btn-primary p-2 rounded-full transition-colors"
            title="Quick add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {!pizza.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg pc-text">{pizza.name}</h3>
          <span className="font-bold text-gradient">{formatCurrency(displayUnit)}</span>
        </div>

        <p className="pc-text-secondary text-sm mb-3 line-clamp-2">{pizza.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium pc-text">{pizza.rating}</span>
            <span className="text-sm pc-text-muted">({pizza.reviewCount})</span>
          </div>

          <div className="flex items-center space-x-1">
            {pizza.category === 'vegetarian' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                Veggie
              </span>
            )}
            {pizza.category === 'meat' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                Meat
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;