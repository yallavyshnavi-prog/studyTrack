const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, getStatus } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'StudyTrack API',
    timestamp: new Date(),
    database: getStatus() ? 'connected' : 'disconnected (in-memory mode)',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\x1b[36m🚀 StudyTrack Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`);
    console.log(`\x1b[35m⚡ Health check: http://localhost:${PORT}/api/health\x1b[0m`);
  });
});
