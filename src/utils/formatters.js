// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Try to parse the date - handle various formats
  let date;
  
  // Check if it's already in a format like "12/31/2024" or "12/31/2024, 12:00:00 AM"
  if (typeof dateString === 'string' && dateString.includes('/')) {
    date = new Date(dateString);
  }
  // Check if it's ISO format or YYYY-MM-DD
  else if (typeof dateString === 'string' && (dateString.includes('-') || dateString.includes('T'))) {
    date = new Date(dateString);
  }
  // Otherwise just return the date string as-is
  else {
    return String(dateString);
  }
  
  // If parsing failed (Invalid Date), return the original string
  if (isNaN(date.getTime())) {
    return String(dateString);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateInput = (dateString) => {
  if (!dateString) return '';
  
  let date;
  
  // Check if it's already in a format like "12/31/2024"
  if (typeof dateString === 'string' && dateString.includes('/')) {
    date = new Date(dateString);
  }
  // Check if it's ISO format or YYYY-MM-DD
  else if (typeof dateString === 'string' && (dateString.includes('-') || dateString.includes('T'))) {
    date = new Date(dateString);
  }
  // Otherwise can't parse
  else {
    return String(dateString);
  }
  
  if (isNaN(date.getTime())) {
    return String(dateString);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format currency to Indian Rupee (INR) with Indian numbering system
// Converts: 1234567.89 -> ₹12,34,567.89 (with Indian comma formatting)
export const formatCurrencyINR = (amount) => {
  if (amount === 0 || !amount) return '₹0.00';
  
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Split into integer and decimal parts
  const parts = absoluteAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Indian numbering system: add commas after every 2 digits from the right
  // except for the first 3 digits
  let formatted = '';
  
  if (integerPart.length <= 3) {
    formatted = integerPart;
  } else {
    // Separate last 3 digits
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    // Add commas to remaining part (every 2 digits from right)
    let remainingFormatted = '';
    for (let i = remaining.length - 1; i >= 0; i--) {
      if ((remaining.length - i - 1) % 2 === 0 && remainingFormatted.length > 0) {
        remainingFormatted = ',' + remainingFormatted;
      }
      remainingFormatted = remaining[i] + remainingFormatted;
    }
    
    formatted = remainingFormatted + ',' + lastThree;
  }
  
  // Combine with decimal part
  const result = `${formatted}.${decimalPart}`;
  
  // Add rupee symbol and handle negative sign
  return isNegative ? `-₹${result}` : `₹${result}`;
};

// Parse currency string to number
export const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};
