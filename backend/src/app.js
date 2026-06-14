const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scan.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  /^chrome-extension:\/\//,
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    cb(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
}));

app.use(express.json());

app.use('/api/scan', scanRoutes);
app.use('/api/report', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
