// Load environment variables
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db');

const PORT = process.env.PORT || 3000;

// Validate required env vars before starting
const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'CLIENT_URL'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
