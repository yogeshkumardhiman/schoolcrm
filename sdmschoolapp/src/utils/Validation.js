export const Validation = {
  isEmpty: (val) => !val || val.trim().length === 0,
  isEmail: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  isMobile: (val) => /^\d{10}$/.test(val),
  isPasswordMinLength: (val, min = 6) => val && val.length >= min,
};

export const validateLogin = (admissionNo, password) => {
  const errors = {};
  if (Validation.isEmpty(admissionNo)) errors.admissionNo = 'Admission number is required';
  if (Validation.isEmpty(password)) errors.password = 'Password is required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
