// Input validation utilities
export const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateDescription = (description) => {
  return description && description.trim().length > 0;
};

export const validateCategory = (category, validCategories) => {
  return validCategories.includes(category);
};

export const validateTransaction = (transaction, validCategories) => {
  const errors = {};

  if (!validateDate(transaction.date)) {
    errors.date = 'Valid date is required';
  }

  if (!validateCategory(transaction.category, validCategories)) {
    errors.category = 'Valid category is required';
  }

  if (!validateDescription(transaction.description)) {
    errors.description = 'Description is required';
  }

  if (!validateAmount(transaction.amount)) {
    errors.amount = 'Valid amount is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
