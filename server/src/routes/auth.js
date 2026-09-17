const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.get('/me', auth, ctrl.getMe);
router.put('/change-password', auth, ctrl.changePassword);

module.exports = router;
