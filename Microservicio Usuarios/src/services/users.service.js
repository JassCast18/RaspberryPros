const usersRepository = require('../repositories/users.repository');
const { AppError } = require('../utils/errors');

async function listUsers() {
  return usersRepository.listUsers();
}

async function getUserById(id) {
  const user = await usersRepository.findUserById(id);
  if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  return user;
}

module.exports = { listUsers, getUserById };
