const express = require('express');
const {
  getTasksByProject,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyTasks);
router.get('/project/:projectId', getTasksByProject);
router.route('/').post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.put('/:id/status', updateTaskStatus);
router.post('/:id/comment', addComment);

module.exports = router;
