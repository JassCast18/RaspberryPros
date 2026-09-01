const usersService = require('../services/users.service');
const { parseUserId } = require('../validators/users.validator');
const { AppError } = require('../utils/errors');

async function list(request, response) {
  const users = await usersService.listUsers();
  return response.status(200).json({ users });
}

async function getById(request, response) {
  const id = parseUserId(request.params.id);
  const isAdmin = request.auth.roles.includes('admin');
  if (!isAdmin && String(id) !== String(request.auth.sub)) {
    throw new AppError(403, 'Insufficient permissions', 'FORBIDDEN');
  }

  const user = await usersService.getUserById(id);
  return response.status(200).json(user);
}

module.exports = { list, getById };
