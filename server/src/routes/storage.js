const router = require('express').Router();
const ctrl = require('../controllers/storageController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/health', ctrl.getHealth);
router.delete('/purge', ctrl.purge);

module.exports = router;
