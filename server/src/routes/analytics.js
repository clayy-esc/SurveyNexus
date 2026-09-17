const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:id/analytics', ctrl.getAnalytics);

module.exports = router;
