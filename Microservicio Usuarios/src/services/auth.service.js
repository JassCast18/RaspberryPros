const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/users.repository');
const { AppError } = require('../utils/errors');

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return process.env.JWT_SECRET;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function register({ name, email, password }) {
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, Math.min(Math.max(rounds, 4), 15));
  const user = await usersRepository.createUser({ name, email, passwordHash });
  return publicUser(user);
}

async function login({ email, password }) {
  const user = await usersRepository.findUserByEmail(email);
  const passwordMatches = user && user.isActive ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!passwordMatches) throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  const token = jwt.sign({ email: user.email, roles: user.roles }, getJwtSecret(), {
    subject: String(user.id),
    expiresIn
  });

  return { token, expiresIn, user: publicUser(user) };
}

module.exports = { register, login };
