const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

function authenticate(request, _response, next) {
  const header = request.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication token is required', 'TOKEN_REQUIRED'));
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    request.auth = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
}

module.exports = { authenticate };
