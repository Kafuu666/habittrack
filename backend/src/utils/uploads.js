const path = require('path');

// backend/uploads/ (diabaikan git). Dilayani publik lewat GET /uploads/...
const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars');
const AVATAR_URL_PREFIX = '/uploads/avatars';

module.exports = { UPLOAD_ROOT, AVATAR_DIR, AVATAR_URL_PREFIX };
