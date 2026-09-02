const authApiUrl = process.env.AUTH_API_URL || 'http://localhost:3001';
const productsApiUrl = process.env.PRODUCTS_API_URL || 'http://localhost:3002';
const upstreamTimeoutMs = Number(process.env.UPSTREAM_TIMEOUT_MS) || 5000;

module.exports = { authApiUrl, productsApiUrl, upstreamTimeoutMs };
