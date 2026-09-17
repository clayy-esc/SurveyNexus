const router = require('express').Router();
const ctrl = require('../controllers/responseController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:id/responses', ctrl.list);
router.get('/:id/responses/export/csv', ctrl.exportCSV);
router.get('/:id/responses/export/json', ctrl.exportJSON);
router.get('/:id/responses/:responseId', ctrl.getById);
router.delete('/:id/responses/:responseId', ctrl.remove);
router.delete('/:id/responses', ctrl.bulkDelete);

module.exports = router;
