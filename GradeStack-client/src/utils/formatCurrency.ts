export const formatVND = (value: number | string): string => {
  // Convert to string and remove any non-digit characters
  const number = value.toString().replace(/\D/g, "");
  // Format with commas
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `VND ${formatted}`;
};

export const parseVND = (value: string): number => {
  // Remove all non-digit characters and convert to number
  return parseInt(value.replace(/\D/g, ""), 10);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
