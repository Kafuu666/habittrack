const authService = require('../services/authService');
const profileService = require('../services/profileService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');

exports.register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.valid.body);
  created(res, data, 'Registrasi berhasil');
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.valid.body);
  ok(res, data, 'Login berhasil');
});

exports.me = asyncHandler(async (req, res) => {
  ok(res, authService.serializeUser(req.user), 'Profil pengguna');
});

exports.updateMe = asyncHandler(async (req, res) => {
  ok(res, await profileService.updateProfile(req.user, req.valid.body), 'Profil diperbarui');
});

exports.uploadPhoto = asyncHandler(async (req, res) => {
  ok(res, await profileService.setPhoto(req.user, req.file), 'Foto profil diperbarui');
});

exports.removePhoto = asyncHandler(async (req, res) => {
  ok(res, await profileService.removePhoto(req.user), 'Foto profil dihapus');
});

// JWT bersifat stateless: logout dilakukan klien dengan menghapus token dari penyimpanan perangkat.
exports.logout = asyncHandler(async (req, res) => {
  ok(res, null, 'Logout berhasil. Hapus token dari perangkat.');
});
