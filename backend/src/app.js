const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scan.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/scan', scanRoutes);
app.use('/api/report', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
