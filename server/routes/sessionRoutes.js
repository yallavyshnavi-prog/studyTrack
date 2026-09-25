const express = require('express');
const router = express.Router();
const {
  logSession,
  getRecentSessions,
  deleteSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', logSession);
router.get('/recent', getRecentSessions);
router.delete('/:id', deleteSession);

module.exports = router;
