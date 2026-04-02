const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Advanced Request & Error Logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;

  res.json = function (body) {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    
    let logMsg = `[${new Date().toLocaleString()}] ${req.method} ${req.url} | Status: ${res.statusCode} | ${duration}ms`;
    
    // Nêú là lỗi, in luôn chi tiết lỗi ra Terminal
    if (isError) {
      logMsg += ` | ❌ Lỗi: ${body.message || 'Không rõ'}`;
      if (req.body && Object.keys(req.body).length > 0) {
        // Dấu đi password trước khi in req.body
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = '***';
        logMsg += ` | Dữ liệu gửi lên: ${JSON.stringify(safeBody)}`;
      }
    } else {
      logMsg += ` | ✅ Thành công`;
    }

    console.log(logMsg);
    return originalJson.call(this, body);
  };
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Auth API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
