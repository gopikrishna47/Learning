function validateLogin({ email = '', password = '' } = {}) {
  const errors = {};
  const trimmed = email.trim();
  if (!trimmed) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) errors.email = 'Enter a valid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}
