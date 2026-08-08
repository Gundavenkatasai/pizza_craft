import React, { useState } from 'react';
import { X, Star, Minus, Plus } from 'lucide-react';
import { Pizza, PizzaSize } from '../types';
import { useCart } from '../contexts/CartContext';
import { formatCurrency, calculatePizzaPrice } from '../utils/currency';

interface PizzaModalProps {
  pizza: Pizza;
  onClose: () => void;
}

const PizzaModal: React.FC<PizzaModalProps> = ({ pizza, onClose }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(
    pizza.sizes?.find(s => (s.name || '').toLowerCase() === 'small') || pizza.sizes?.[0] || { name: 'Regular', priceMultiplier: 1 }
  );
  const [quantity, setQuantity] = useState(1);

  const isPizza = pizza.category?.toLowerCase() === 'pizzas' || pizza.category?.toLowerCase() === 'vegetarian' || pizza.category?.toLowerCase() === 'meat';

  const computeUnitPrice = (p: Pizza, size: PizzaSize) => {
    const baseMultiplier = size?.priceMultiplier || 1;
    const base = p.basePrice * baseMultiplier;
    
    if (!isPizza) return Math.round(base * 100) / 100;
    
    const sizeKey = (size?.name || '').toLowerCase();
    const ingredientCount = (p.ingredients || []).length || 0;
    const computed = calculatePizzaPrice(base, ingredientCount, sizeKey);
    return Math.round(computed * 100) / 100;
  };

  const unitPrice = computeUnitPrice(pizza, selectedSize);
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleAddToCart = () => {
    addItem(pizza, selectedSize, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-64 object-cover rounded-t-xl"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&q=80';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{pizza.name}</h2>
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-700">{pizza.rating}</span>
                <span className="text-gray-500">({pizza.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {pizza.category === 'vegetarian' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Vegetarian
                </span>
              )}
              {pizza.category === 'meat' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Meat Lovers
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-6">{pizza.description}</p>

          {pizza.ingredients && pizza.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {pizza.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pizza.sizes && pizza.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Choose Size</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pizza.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      selectedSize.name === size.name
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{size.name}</div>
                    <div className="text-sm text-gray-500">{size.diameter}</div>
                    <div className="font-semibold text-primary-600">
                      {formatCurrency(computeUnitPrice(pizza, size))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-medium px-3">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!pizza.available}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Cart - {formatCurrency(totalPrice)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaModal;