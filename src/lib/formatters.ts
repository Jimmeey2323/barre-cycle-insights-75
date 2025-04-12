
/**
 * Format a number with commas as thousands separators
 */
export const formatNumber = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numberValue)) return '0';
  
  return new Intl.NumberFormat('en-IN').format(
    Math.round(numberValue * 10) / 10
  );
};

/**
 * Format a number as Indian Rupees (INR)
 */
export const formatINR = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numberValue)) return '₹0';
  
  return `₹${new Intl.NumberFormat('en-IN').format(
    Math.round(numberValue * 10) / 10
  )}`;
};

/**
 * Format a number as US Dollars (USD)
 */
export const formatUSD = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numberValue)) return '$0';
  
  return `$${new Intl.NumberFormat('en-US').format(
    Math.round(numberValue * 10) / 10
  )}`;
};

/**
 * Format a number as a percentage
 */
export const formatPercent = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numberValue)) return '0%';
  
  return `${new Intl.NumberFormat('en-IN', { 
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  }).format(numberValue)}%`;
};

/**
 * Format a number with a specific suffix (k, M, B, etc.)
 */
export const formatCompact = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numberValue)) return '0';
  
  return new Intl.NumberFormat('en-IN', { 
    notation: 'compact',
    maximumFractionDigits: 1 
  }).format(numberValue);
};
