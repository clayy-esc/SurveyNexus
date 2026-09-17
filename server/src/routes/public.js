const router = require('express').Router();
const ctrl = require('../controllers/publicController');
const { submitLimiter } = require('../middleware/rateLimiter');

router.get('/survey/:slug', ctrl.getSurvey);
router.post('/survey/:slug/submit', submitLimiter, ctrl.submit);

module.exports = router;
