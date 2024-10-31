const Task = require('../models/Task');
const mongoose = require("mongoose");

const createResponse = (statusCode, message, tasks = []) => ({
    statusCode,
    message,
    tasks,
});

// Create a new task
exports.createTask = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { title, description, assignedTo } = req.body;

            // Create a new task document
            const newTask = new Task({
                title,
                description,
                assignedTo: [...assignedTo],
                isShared: assignedTo.length > 1,
                createdBy: req.user._id,
                taskPosition: [
                    // Map over taskPosition for the task creator
                    ...req.body.taskPosition.map(pos => ({
                        ...pos,
                        userId: req.user._id,
                        position: pos.position
                    })),
                    ...assignedTo.map(userId => ({
                        priority: req.body.taskPosition[0].priority,
                        userId: new mongoose.Types.ObjectId(userId),
                        position: -1
                    }))
                ]
            });

            // Save the new task
            await newTask.save();

            // Save the new Task
            await newTask.save();

            // Return the newly created task
            return res.status(201).json(createResponse(201, 'Task created successfully', newTask));
        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json(createResponse(500, 'An error occurred while creating the task.'));
        }
    } else {
        return res.status(401).json(createResponse(401, 'User not authenticated'));
    }
};

// Get tasks assigned to the user
exports.getTasks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            // Find tasks assigned to the user
            const tasks = await Task.find({
                assignedTo: { $in: [req.user._id] },
                isDeleted: { $ne: true }
            })
                .select('-modified')
                .lean();

            // Filter taskPosition for the current user
            const filteredTasks = tasks.map(task => {
                const filteredTaskPosition = task.taskPosition.find(pos => pos.userId.toString() === req.user._id.toString());
                return {
                    ...task,
                    taskPosition: filteredTaskPosition ? [filteredTaskPosition] : []
                };
            });

            return res.status(200).json(createResponse(200, 'Tasks retrieved successfully', filteredTasks));
        } catch (error) {
            console.error('Error retrieving tasks:', error);
            return res.status(500).json({ message: 'An error occurred while retrieving the tasks.' });
        }
    } else {
        return res.status(401).json({ message: 'User not authenticated' });
    }
};

// Update existing Task 
// Expand, Collapse, Edit, 
exports.updateTaskOrder = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const taskId = new mongoose.Types.ObjectId(req.body._id);
        const userId = req.user._id;
        const userTaskPosition = req.body.taskPosition[0];

        // Step 1: Find the task to get the current taskPosition and other fields
        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Step 2: Check if any of the specific fields have changed
        const fieldsToTriggerIncrement = ['title', 'description', 'assignedTo'];
        const hasTriggerFieldChanged = fieldsToTriggerIncrement.some(
            field => req.body[field] !== undefined && req.body[field] !== existingTask[field]
        );

        // Step 3: Create a map of existing taskPosition entries by userId for quick lookup
        const taskPositionMap = new Map(
            existingTask.taskPosition.map((pos) => [pos.userId.toString(), pos])
        );

        // Step 4: Iterate through assignedTo and ensure each has a taskPosition entry
        req.body.assignedTo.forEach((assignedUserId) => {
            if (!taskPositionMap.has(assignedUserId.toString())) {
                // Add a new entry if userId is missing in taskPosition
                taskPositionMap.set(assignedUserId.toString(), {
                    userId: new mongoose.Types.ObjectId(assignedUserId),
                    priority: userTaskPosition.priority,
                    position: -1,
                    isExpanded: true
                });
            }
        });

        // Step 5: Update the current user's taskPosition if it exists in the map
        if (taskPositionMap.has(userId.toString())) {
            const currentUserPosition = taskPositionMap.get(userId.toString());
            currentUserPosition.priority = userTaskPosition.priority;
            currentUserPosition.position = userTaskPosition.position;
            currentUserPosition.isExpanded = userTaskPosition.isExpanded;
        }

        // Step 6: Convert map back to array for storage and prepare update
        const updatedTaskPositionArray = Array.from(taskPositionMap.values());

        // Step 7: Build the update object
        const updateObject = {
            $set: {
                title: req.body.title,
                description: req.body.description,
                isDeleted: req.body.isDeleted,
                isShared: req.body.assignedTo.length > 1,
                isCompleted: req.body.isCompleted,
                assignedTo: req.body.assignedTo,
                taskPosition: updatedTaskPositionArray
            }
        };

        // Step 8: Conditionally add the version increment
        if (hasTriggerFieldChanged) {
            updateObject.$inc = { __v: 1 };
        }

        // Step 9: Perform the update with conditional version increment
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, __v: req.body.__v },  // Check current version
            updateObject,
            { new: true, runValidators: true }
        );

        // Handle no matching document (conflict)
        if (!updatedTask) {
            return res.status(409).json({
                message: "Update conflict: The task was modified elsewhere. Please refresh and try again."
            });
        }

        // Filter and respond with the current user's taskPosition only
        const filteredTaskPosition = updatedTask.taskPosition.find(
            (pos) => pos.userId.toString() === userId.toString()
        );
        const responseTask = {
            ...updatedTask.toObject(),
            taskPosition: filteredTaskPosition ? [filteredTaskPosition] : []
        };

        return res.status(200).json(createResponse(200, 'Task updated successfully', responseTask));
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'An error occurred while updating the task.' });
    }
};

// Update multiple tasks
exports.updateTasksServer = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const tasksToUpdate = req.body;

            // Iterate through tasks and update each one
            const updatePromises = tasksToUpdate.map((taskData) => {
                return Task.findOneAndUpdate(
                    {
                        _id: new mongoose.Types.ObjectId(taskData._id),
                        assignedTo: { $in: [req.user._id] }
                    },
                    taskData,
                    { new: true }
                );
            });

            // Execute all update operations
            const updatedTasks = await Promise.all(updatePromises);

            // Check if any tasks were not found (null values in the array)
            const failedUpdates = updatedTasks.filter((task) => !task);
            if (failedUpdates.length > 0) {
                return res.status(404).json({
                    message: `${failedUpdates.length} tasks were not found or not assigned to the user.`,
                });
            }

            const allUpdatedTasks = await Task.find({
                assignedTo: req.user._id,
                isDeleted: { $ne: true }
            });

            return res.status(200).json(createResponse(200, 'Tasks updated successfully', allUpdatedTasks));
        } catch (error) {
            console.error('Error updating tasks:', error);
            return res.status(500).json({ message: 'An error occurred while updating tasks.' });
        }
    } else {
        return res.status(401).json({ message: 'User not authenticated' });
    }
};

// Update multiple tasks
const updateMultipleTasksWithTransaction = async (tasksToUpdate, userId) => {
    const session = await mongoose.startSession();
    try {
        const transactionResult = await session.withTransaction(async () => {
            const userIdObj = new mongoose.Types.ObjectId(userId);

            const updatePromises = tasksToUpdate.map((taskData) => {

                const buildSetObject = () => {
                    const setObj = {};

                    // Handle other fields
                    const allowedFields = ['title', 'description', 'isDeleted', 'isCompleted'];
                    allowedFields.forEach(field => {
                        if (taskData[field] !== undefined) {
                            setObj[field] = taskData[field];
                        }
                    });

                    // Update the taskPosition array
                    setObj.taskPosition = {
                        $concatArrays: [
                            {
                                $filter: {
                                    input: '$taskPosition',
                                    cond: {
                                        $ne: [
                                            { $toString: '$$this.userId' },
                                            userIdObj.toString()
                                        ]
                                    }
                                }
                            },
                            [
                                {
                                    ...taskData.taskPosition[0],
                                    userId: userIdObj
                                }
                            ]
                        ]
                    };
                    return setObj;
                };

                // Prepare the aggregation pipeline update
                const update = [
                    {
                        $set: buildSetObject()
                    }
                ];

                const options = { new: true, session };

                return Task.findOneAndUpdate(
                    {
                        _id: new mongoose.Types.ObjectId(taskData._id),
                        assignedTo: { $in: [userIdObj] }
                    },
                    update,
                    options
                );
            });

            const updatedTasks = await Promise.all(updatePromises);

            // Check if any tasks were not found or not updated
            const failedUpdates = updatedTasks.filter((task) => !task);
            if (failedUpdates.length > 0) {
                throw new Error(`${failedUpdates.length} tasks were not found or not assigned to the user.`);
            }

            // If all tasks are successfully updated, return the updated tasks
            return { success: true, updatedTasks };
        });

        // Return the transaction result if successful
        return transactionResult;
    } catch (error) {
        console.error('Error during transaction:', error);
        return { success: false, message: 'An error occurred during the transaction.', error };
    } finally {
        session.endSession();
    }
};

// D&D, Complete, Restore, Delete
exports.updateTasksOrderServer = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const tasksToUpdate = req.body;

            if (!Array.isArray(tasksToUpdate)) {
                return res.status(400).json({ message: 'Invalid input. Expected an array of tasks.' });
            }

            const result = await updateMultipleTasksWithTransaction(tasksToUpdate, req.user._id);

            if (!result.success) {
                return res.status(404).json({ message: result.message });
            }

            // Fetch all tasks assigned to the user after the updates
            const allUpdatedTasks = await Task.find({
                assignedTo: req.user._id,
            });

            // Filter taskPosition for each task to include only the current user's data
            const userSpecificTasks = allUpdatedTasks.map(task => {
                const filteredTaskPosition = task.taskPosition.find(pos => pos.userId.toString() === req.user._id.toString());
                return {
                    ...task.toObject(),
                    taskPosition: filteredTaskPosition ? [filteredTaskPosition] : []
                };
            });

            return res.status(200).json(createResponse(200, 'Tasks updated successfully', userSpecificTasks));
        } catch (error) {
            console.error('Error updating tasks:', error);
            return res.status(500).json({ message: 'An error occurred while updating tasks.', error });
        }
    } else {
        return res.status(401).json({ message: 'User not authenticated' });
    }
};