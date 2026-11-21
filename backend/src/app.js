const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const routes = require('./routes');
const { UPLOAD_ROOT } = require('./utils/uploads');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

// Foto profil di /uploads boleh dimuat lintas-origin (aplikasi mobile / web)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',') }));
app.use(express.json({ limit: '100kb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Foto profil. Nama file unik per unggahan (berisi waktu + acak), jadi aman di-cache lama.
app.use('/uploads', express.static(UPLOAD_ROOT, { index: false, dotfiles: 'deny', maxAge: '7d', immutable: true }));

app.get('/health', (req, res) => res.json({ success: true, message: 'HabitTrack API berjalan' }));

// Batasi percobaan login/registrasi untuk mengurangi brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.nodeEnv === 'production' ? 30 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
