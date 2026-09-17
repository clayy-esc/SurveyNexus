const router = require('express').Router();
const ctrl = require('../controllers/surveyController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/publish', ctrl.publish);
router.post('/:id/unpublish', ctrl.unpublish);
router.post('/:id/close', ctrl.close);
router.post('/:id/reopen', ctrl.reopen);

module.exports = router;
