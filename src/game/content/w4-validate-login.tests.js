const { validateLogin } = exports;

test('valid credentials produce no errors', () => {
  expect(validateLogin({ email: 'ada@example.com', password: 'correct-horse' })).toEqual({});
});

test('empty form → both fields are required', () => {
  expect(validateLogin({ email: '', password: '' })).toEqual({ email: 'Email is required', password: 'Password is required' });
  expect(validateLogin()).toEqual({ email: 'Email is required', password: 'Password is required' });
});

test('an email made of spaces counts as empty', () => {
  expect(validateLogin({ email: '   ', password: 'longenough' }).email).toBe('Email is required');
});

test('rejects malformed emails', () => {
  for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a b@example.com']) {
    expect(validateLogin({ email, password: 'longenough' }).email).toBe('Enter a valid email');
  }
});

test('trims whitespace around a valid email', () => {
  expect(validateLogin({ email: '  ada@example.com  ', password: 'longenough' })).toEqual({});
});

test('passwords shorter than 8 characters are rejected', () => {
  expect(validateLogin({ email: 'ada@example.com', password: 'short' }).password).toBe('Password must be at least 8 characters');
});

test('passwords are NOT trimmed (spaces are legal characters)', () => {
  expect(validateLogin({ email: 'ada@example.com', password: '        ' })).toEqual({});
});

test('only the broken field gets an error', () => {
  expect(validateLogin({ email: 'ada@example.com', password: '' })).toEqual({ password: 'Password is required' });
});
