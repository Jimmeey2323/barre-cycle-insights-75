
/**
 * Format a number as Indian Rupees (INR)
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format a decimal number with specified digits
 */
export const formatDecimal = (num: number, digits: number = 1): string => {
  return num.toFixed(digits);
};
