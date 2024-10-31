const Task = require('../models/Task');

const updateTasksForRemovedMembers = async (memberIds) => {
    try {
        const membersToRemove = memberIds.map(id => id.toString());

        // Find all team tasks where removed members are assigned
        const tasks = await Task.find({
            teamId: { $ne: null },
            assignedTo: { $in: membersToRemove }
        });

        // Modify tasks and gather bulk write operations
        const bulkOperations = tasks.map(task => {
            // Remove the members from assignedTo and taskPosition
            task.assignedTo = task.assignedTo.filter(userId => !membersToRemove.includes(userId.toString()));
            task.taskPosition = task.taskPosition.filter(pos => !membersToRemove.includes(pos.userId.toString()));

            // Return a bulk update operation for each modified task
            return {
                updateOne: {
                    filter: { _id: task._id },
                    update: {
                        assignedTo: task.assignedTo,
                        taskPosition: task.taskPosition
                    }
                }
            };
        });

        // Perform all updates in a single bulk operation if any tasks need updating
        if (bulkOperations.length) await Task.bulkWrite(bulkOperations);

        return { success: true };
    } catch (error) {
        console.error('Error updating tasks for removed members:', error);
        return { success: false, error };
    }
};


module.exports = { updateTasksForRemovedMembers };