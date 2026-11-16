require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) {
  console.error('JWT_SECRET must be set and at least 32 characters in production');
  process.exit(1);
}

connectDB();

const app = express();

// CLIENT_URL = your site address (comma separated for several). Unset = allow all (local dev).
const origins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : undefined));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'TutorFlow API' });
});

app.use('/api', require('./routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
