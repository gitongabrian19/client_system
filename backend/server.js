const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', require('./routes/devices'));
app.use('/api/ips', require('./routes/ips'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/sms', require('./routes/sms'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
