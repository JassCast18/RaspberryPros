const express = require('express');
const { checkDatabaseConnection } = require('./config/database');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use('/api/ventas', ventasRoutes);

app.get('/api/health', async (_request, response) => {
  try {
    await checkDatabaseConnection();
    response.status(200).json({ status: 'ok', database: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    response.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ error: 'Invalid JSON body' });
  }

  if (error.statusCode) {
    const payload = { error: error.message, code: error.code };
    if (error.details) payload.details = error.details;
    return response.status(error.statusCode).json(payload);
  }

  console.error('Unhandled error:', error);
  return response.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
