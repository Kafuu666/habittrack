const multer = require('multer');

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

// Foto ditahan di memori, divalidasi (tipe asli dari byte file), baru ditulis ke disk oleh service.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 5 },
});

// Field form-data yang dipakai klien: "photo"
const photoUpload = upload.single('photo');

module.exports = { photoUpload, MAX_PHOTO_BYTES };
