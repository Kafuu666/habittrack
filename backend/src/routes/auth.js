const router = require('express').Router();
const controller = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { photoUpload } = require('../middlewares/upload');
const v = require('../validators');

router.post('/register', validate(v.register), controller.register);
router.post('/login', validate(v.login), controller.login);
router.get('/me', auth, controller.me);
router.put('/me', auth, validate(v.updateProfile), controller.updateMe);
// auth dijalankan lebih dulu agar permintaan tanpa login tidak sempat menahan file di memori
router.put('/me/photo', auth, photoUpload, controller.uploadPhoto);
router.delete('/me/photo', auth, controller.removePhoto);
router.post('/logout', auth, controller.logout);

module.exports = router;
