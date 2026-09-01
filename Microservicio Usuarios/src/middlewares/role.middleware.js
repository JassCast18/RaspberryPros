const { AppError } = require('../utils/errors');

function requireRole(role) {
  return (request, _response, next) => {
    if (!request.auth || !Array.isArray(request.auth.roles) || !request.auth.roles.includes(role)) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = { requireRole };
