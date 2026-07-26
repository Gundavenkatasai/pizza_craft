import { menuAPI } from './api'
import type { Pizza, PizzaSize } from '../types'

export const menuService = {
  async getPizzas(filters?: {
    category?: string
    available?: boolean
    search?: string
  }) {
    try {
      // Use the Express backend API instead of direct Supabase connection
      const response = await menuAPI.getPizzas(filters);
      const data = response.data;
      
      return data?.map((pizza: any) => ({
        id: pizza._id || pizza.id,
        name: pizza.name,
        description: pizza.description,
        image: pizza.image,
        basePrice: Number(pizza.base_price || pizza.basePrice),
        category: pizza.category,
        ingredients: pizza.ingredients || [],
        available: pizza.available ?? true,
        rating: Number(pizza.rating) || 0,
        reviewCount: pizza.review_count || 0,
        sizes: pizza.pizza_sizes?.map((size: any) => ({
          id: size._id || size.id,
          name: size.name,
          diameter: size.diameter,
          priceMultiplier: Number(size.price_multiplier || size.priceMultiplier),
        })) || [],
        createdAt: pizza.created_at || pizza.createdAt,
        updatedAt: pizza.updated_at || pizza.updatedAt,
      })) as Pizza[];
    } catch (error) {
      console.error('Get pizzas error:', error)
      throw error
    }
  },

  async getPizza(id: string) {
    try {
      const response = await menuAPI.getPizza(id);
      const data = response.data;

      return {
        id: data._id || data.id,
        name: data.name,
        description: data.description,
        image: data.image,
        basePrice: Number(data.base_price || data.basePrice),
        category: data.category,
        ingredients: data.ingredients || [],
        available: data.available ?? true,
        rating: Number(data.rating) || 0,
        reviewCount: data.review_count || 0,
        sizes: data.pizza_sizes?.map((size: any) => ({
          id: size._id || size.id,
          name: size.name,
          diameter: size.diameter,
          priceMultiplier: Number(size.price_multiplier || size.priceMultiplier),
        })) || [],
        reviews: data.reviews?.map((review: any) => ({
          id: review._id || review.id,
          userId: review.user_id,
          userName: `${review.users?.first_name} ${review.users?.last_name}`,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at || review.createdAt,
        })) || [],
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt,
      } as Pizza;
    } catch (error) {
      console.error('Get pizza error:', error)
      throw error
    }
  },

  async getPizzaSizes() {
    try {
      // The old site fetched these from supabase. Now they are usually embedded inside the pizza doc.
      // Returning default sizes for fallback if needed.
      return [
        { id: '1', pizzaId: '', name: 'small', diameter: '10"', priceMultiplier: 1, createdAt: new Date().toISOString() },
        { id: '2', pizzaId: '', name: 'medium', diameter: '12"', priceMultiplier: 1.3, createdAt: new Date().toISOString() },
        { id: '3', pizzaId: '', name: 'large', diameter: '14"', priceMultiplier: 1.6, createdAt: new Date().toISOString() },
        { id: '4', pizzaId: '', name: 'xl', diameter: '16"', priceMultiplier: 2, createdAt: new Date().toISOString() }
      ] as PizzaSize[];
    } catch (error) {
      console.error('Get pizza sizes error:', error)
      throw error
    }
  },

  async getCategories() {
    try {
      const response = await menuAPI.getCategories();
      return response.data || [];
    } catch (error) {
      console.error('Get categories error:', error)
      throw error
    }
  }
}