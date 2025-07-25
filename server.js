const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const studentsRoutes = require('./routes/students');
const teachersRoutes = require('./routes/teachers');
const subjectSetsRoutes = require('./routes/subjectSets');
const classesRoutes = require('./routes/classes');
const sessionsRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/attendance');
const faceDataRoutes = require('./routes/faceData');
const authRoutes = require('./routes/auth');

// Import database connection to initialize pool
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Firebase Studio compatibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Educational Attendance Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/students', studentsRoutes);
app.use('/teachers', teachersRoutes);
app.use('/subject-sets', subjectSetsRoutes);
app.use('/classes', classesRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/face-data', faceDataRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Educational Attendance Management API`);
  console.log(`🔗 CORS enabled for Firebase Studio integration`);
});

module.exports = app;
