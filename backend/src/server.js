import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'client_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

const PORT = process.env.PORT || 5000;

if (import.meta.env.PROD) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export const viteNodeApp = app;
