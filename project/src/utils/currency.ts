// Currency utilities for Indian market
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Convert USD prices to INR (approximate conversion for demo)
// In production, you'd use real-time exchange rates
export const convertToINR = (usdAmount: number): number => {
  const USD_TO_INR_RATE = 83; // Approximate rate
  return usdAmount * USD_TO_INR_RATE;
};

// Format currency with Indian number system
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// For displaying large numbers in Indian style (lakhs, crores)
export const formatIndianNumber = (num: number): string => {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(1)} L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Pizza Price Calculation Constants
export const SIZE_EXTRA: { [key: string]: number } = {
  small: 75,
  medium: 85,
  large: 95,
  xl: 100
};

export const INGREDIENT_MODIFIER = 10; // Extra cost per ingredient

// Calculate pizza price based on base price, ingredients, and size
export const calculatePizzaPrice = (basePrice: number, ingredientsCount: number, sizeName: string): number => {
  const sizeKey = sizeName.toLowerCase();
  const sizeCost = SIZE_EXTRA[sizeKey] ?? SIZE_EXTRA['regular'];
  return basePrice + (ingredientsCount * INGREDIENT_MODIFIER) + sizeCost;
};

// Calculate delivery fee
export const calculateDeliveryFee = (subtotal: number): number => {
  // Free delivery for orders over ₹2500 (approx $30 equivalent, assuming INR pricing)
  // Or simply 2.99 if in USD context. Our formatCurrency prepends ₹.
  // Actually, since pricing is in INR now, let's say free delivery over ₹500, else ₹40 delivery fee
  return subtotal > 500 ? 0 : 40;
};
