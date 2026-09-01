const authService = require('../services/auth.service');
const { validateRegistration, validateLogin } = require('../validators/users.validator');

async function register(request, response) {
  const data = validateRegistration(request.body);
  const user = await authService.register(data);
  return response.status(201).json(user);
}

async function login(request, response) {
  const data = validateLogin(request.body);
  const result = await authService.login(data);
  return response.status(200).json(result);
}

module.exports = { register, login };
