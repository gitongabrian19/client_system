import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import deviceRoutes from './routes/devices.js';
import ipRoutes from './routes/ips.js';
import clientRoutes from './routes/clients.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.use('/api/devices', deviceRoutes);
app.use('/api/ips', ipRoutes);
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 5000;

if (import.meta.env.PROD) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export const viteNodeApp = app;
