const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    // Only test connection if database credentials are provided
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.log('⚠️  Database credentials not configured. Please set up your environment variables.');
      console.log('   Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
      return;
    }
    
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('   Please check your database credentials and ensure the database is accessible.');
  }
}

// Initialize connection test
testConnection();

module.exports = pool;
