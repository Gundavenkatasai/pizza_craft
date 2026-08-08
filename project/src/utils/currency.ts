// Currency utilities for Indian market
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Convert USD prices to INR (approximate conversion for demo)
export const convertToINR = (usdAmount: number): number => {
  const USD_TO_INR_RATE = 83;
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

export const INGREDIENT_MODIFIER = 0;

// Calculate pizza price strictly based on base price set by admin
export const calculatePizzaPrice = (basePrice: number, ingredientsCount: number = 0, sizeName: string = 'small'): number => {
  return basePrice;
};

// Calculate delivery fee
export const calculateDeliveryFee = (subtotal: number): number => {
  return subtotal > 500 ? 0 : 40;
};
