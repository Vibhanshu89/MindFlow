const express = require('express');
const {
  analyzeStandup,
  prioritizeTasks,
  predictRisk,
  getStandups,
  generateTaskSuggestions,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/standup', analyzeStandup);
router.get('/standups/:projectId', getStandups);
router.post('/prioritize-tasks', prioritizeTasks);
router.post('/predict-risk', predictRisk);
router.post('/generate-tasks', generateTaskSuggestions);

module.exports = router;
