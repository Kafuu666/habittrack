const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const { detectImageType } = require('../utils/imageType');
const { AVATAR_DIR, AVATAR_URL_PREFIX } = require('../utils/uploads');
const { serializeUser } = require('./authService');

// Menghapus file foto lama. Hanya path di bawah /uploads/avatars/ yang disentuh, dan nama file
// diambil dengan basename sehingga tidak bisa keluar dari folder avatar.
async function removeFile(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith(`${AVATAR_URL_PREFIX}/`)) return;
  await fs.unlink(path.join(AVATAR_DIR, path.basename(photoUrl))).catch(() => undefined);
}

async function updateProfile(user, { name }) {
  await user.update({ name });
  return serializeUser(user);
}

async function setPhoto(user, file) {
  if (!file) throw new ApiError(422, 'File foto wajib dikirim pada field "photo"');

  const type = detectImageType(file.buffer);
  if (!type) throw new ApiError(422, 'Format foto tidak didukung. Gunakan JPG, PNG, atau WebP');

  // Nama file dibuat server (bukan dari klien): id pengguna + waktu + acak
  const filename = `${user.id}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${type.ext}`;
  const photoUrl = `${AVATAR_URL_PREFIX}/${filename}`;

  await fs.mkdir(AVATAR_DIR, { recursive: true });
  await fs.writeFile(path.join(AVATAR_DIR, filename), file.buffer, { flag: 'wx' });

  const previous = user.photo_url;
  try {
    await user.update({ photo_url: photoUrl });
  } catch (err) {
    await removeFile(photoUrl); // jangan tinggalkan file yatim bila database gagal
    throw err;
  }
  await removeFile(previous);
  return serializeUser(user);
}

async function removePhoto(user) {
  const previous = user.photo_url;
  await user.update({ photo_url: null });
  await removeFile(previous);
  return serializeUser(user);
}

module.exports = { updateProfile, setPhoto, removePhoto };
