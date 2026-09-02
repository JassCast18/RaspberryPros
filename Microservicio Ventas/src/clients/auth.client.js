const { authApiUrl } = require('../config/services');
const { requestJson } = require('./http.client');

async function getUserById(idUsuario, authorization) {
  const headers = {};
  if (authorization) headers.authorization = authorization;

  const payload = await requestJson(`${authApiUrl}/api/users/${idUsuario}`, { headers });
  return payload.user || payload;
}

module.exports = { getUserById };
