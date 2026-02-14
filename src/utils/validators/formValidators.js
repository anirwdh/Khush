export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password.length >= 8;
  },

  strongPassword: (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },

  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  },

  name: (name) => {
    return name.length >= 2 && name.length <= 50;
  },

  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (min) => (value) => {
    return value.length >= min;
  },

  maxLength: (max) => (value) => {
    return value.length <= max;
  },

  numeric: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    rules.forEach(rule => {
      const isValid = rule.validator(value);
      if (!isValid) {
        errors[field] = rule.message;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
