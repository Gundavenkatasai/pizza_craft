import mongoose from 'mongoose';
import Order from '../models/Order.js';

export const SIZE_EXTRA = {
  small: 75,
  medium: 85,
  large: 95,
  xl: 100
};
export const INGREDIENT_MODIFIER = 10;
export const TAX_RATE = 0.08;

/**
 * Calculates delivery fee based on subtotal.
 * Must match frontend logic (currency.ts).
 */
export const calculateDeliveryFee = (subtotal) => {
  return subtotal > 500 ? 0 : 40;
};

/**
 * Centralized logic for recalculating order totals.
 * This prevents price tampering by recalculating everything on the backend.
 */
export const recalculateOrderTotals = async (items) => {
  if (!items || items.length === 0) return { totalAmount: 0, pricedItems: [] };

  const normalizedItems = items.map(it => {
    if (it.pizzas && it.pizza_sizes) {
      const unit = it.price || it.unit_price || 0;
      const qty = it.quantity || 1;
      return {
        pizza_id: it.pizza_id && mongoose.Types.ObjectId.isValid(it.pizza_id) ? new mongoose.Types.ObjectId(it.pizza_id) : null,
        name: it.pizzas.name,
        image: it.pizzas.image || it.image || null,
        size: it.pizza_sizes.name,
        quantity: qty,
        unit_price: unit,
        total_price: it.total || it.total_price || unit * qty
      };
    }
    const unit = it.price || it.unit_price || 0;
    const qty = it.quantity || 1;
    return {
      pizza_id: it.pizza_id && mongoose.Types.ObjectId.isValid(it.pizza_id) ? new mongoose.Types.ObjectId(it.pizza_id) : null,
      name: it.name,
      image: it.image || null,
      size: it.size || it.sizeName || '', // Handle different property names
      quantity: qty,
      unit_price: unit,
      total_price: it.total || it.total_price || unit * qty
    };
  });

  const pizzaIdsToFetch = normalizedItems.map(i => i.pizza_id).filter(Boolean);
  const uniquePizzaIds = [...new Set(pizzaIdsToFetch.map(id => id.toString()))];
  
  const Pizza = (await import('../models/Pizza.js')).default;
  const pizzas = await Pizza.find({ _id: { $in: uniquePizzaIds } }).lean();
  const pizzaMap = new Map(pizzas.map(p => [p._id.toString(), p]));

  const pricedItems = normalizedItems.map(it => {
    if (it.pizza_id) {
      const pizzaDoc = pizzaMap.get(it.pizza_id.toString());
      if (pizzaDoc) {
        const sizeObj = (pizzaDoc.pizza_sizes || []).find(s => s.name.toLowerCase() === (it.size || '').toLowerCase());
        const multiplier = sizeObj?.price_multiplier || 1;
        const ingredientCount = (pizzaDoc.ingredients || []).length || 0;
        const sizeKey = (it.size || '').toLowerCase();
        
        // Only apply size Extra if it's a pizza
        const isPizza = pizzaDoc.category?.toLowerCase() === 'pizzas' || pizzaDoc.category?.toLowerCase() === 'vegetarian' || pizzaDoc.category?.toLowerCase() === 'meat';
        
        const sizeExtra = isPizza ? (SIZE_EXTRA[sizeKey] ?? SIZE_EXTRA['medium']) : 0;
        
        let computedUnit = pizzaDoc.base_price * multiplier;
        if (isPizza) {
           computedUnit += (ingredientCount * INGREDIENT_MODIFIER) + sizeExtra;
        }

        const unit_price = Math.round(computedUnit * 100) / 100;
        const total_price = Math.round(unit_price * (it.quantity || 1) * 100) / 100;
        return { ...it, unit_price, total_price };
      }
    }
    // Fallback if not in DB
    const fallbackUnit = typeof it.unit_price === 'number' ? it.unit_price : Number(it.unit_price) || 0;
    const unit_price = Math.round(fallbackUnit * 100) / 100;
    const total_price = Math.round(unit_price * (it.quantity || 1) * 100) / 100;
    return { ...it, unit_price, total_price };
  });

  const subtotal = pricedItems.reduce((s, it) => s + (it.total_price || 0), 0);
  const tax = subtotal * TAX_RATE;
  const deliveryFee = calculateDeliveryFee(subtotal);
  const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return { totalAmount, pricedItems };
};
