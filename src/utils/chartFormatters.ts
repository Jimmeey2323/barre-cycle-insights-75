import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";

/**
 * Type-safe formatter for chart values
 * Handles single values and arrays by formatting each value appropriately
 */
export const formatChartValue = (value: string | number | (string | number)[], formatter: (val: string | number) => string): string => {
  // If the value is an array, join the formatted values
  if (Array.isArray(value)) {
    return value.map(v => formatter(v)).join(', ');
  }
  
  // Otherwise, format the single value
  return formatter(value);
};

export const formatChartCurrency = (value: string | number | (string | number)[]): string => {
  return formatChartValue(value, val => formatINR(Number(val)));
};

export const formatChartNumber = (value: string | number | (string | number)[]): string => {
  return formatChartValue(value, val => formatNumber(Number(val)));
};

export const formatChartPercent = (value: string | number | (string | number)[]): string => {
  return formatChartValue(value, val => formatPercent(Number(val)));
};
