const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateTask = require('../middleware/validateTask');

// Task Routes
router.post('/addCommentToTask', taskController.addCommentToTask)
router.get('/getTaskComments/:taskId', taskController.getTaskComments);
router.get('/:id', taskController.getTasks);
router.post('/create', validateTask, taskController.createTask);
router.post('/updateTaskOrder', validateTask, taskController.updateTaskOrder);
router.post('/updateTasks', taskController.updateTasksServer);
router.post('/updateTasksOrderOnServer', taskController.updateTasksOrderServer);

module.exports = router;
