const { AppError } = require('../utils/errors');
const { upstreamTimeoutMs } = require('../config/services');

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), upstreamTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new AppError(
        response.status,
        payload?.error || `Upstream request failed with status ${response.status}`,
        payload?.code || 'UPSTREAM_ERROR',
        payload?.details
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'AbortError') {
      throw new AppError(504, 'Upstream service timeout', 'UPSTREAM_TIMEOUT');
    }
    throw new AppError(503, 'Upstream service unavailable', 'UPSTREAM_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { requestJson };
