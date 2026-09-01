const { AppError } = require('../utils/errors');

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateRegistration(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = [];

  if (name.length < 2 || name.length > 120) errors.push('name must contain 2 to 120 characters');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) errors.push('email must be valid');
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) errors.push('password must contain 8 to 72 bytes');

  if (errors.length > 0) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  return { name, email, password };
}

function validateLogin(body = {}) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) throw new AppError(400, 'email and password are required', 'VALIDATION_ERROR');
  return { email, password };
}

function parseUserId(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new AppError(400, 'id must be a positive integer', 'VALIDATION_ERROR');
  }
  return Number(value);
}

module.exports = { validateRegistration, validateLogin, parseUserId };
