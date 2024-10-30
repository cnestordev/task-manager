const Task = require('../models/Task');

const updateTasksForRemovedMembers = async (memberIds) => {
    console.log(memberIds)
    try {
        // Find all tasks where any of the members are either the creator or assigned
        const tasks = await Task.find({
            $or: [
                { createdBy: { $in: memberIds } },
                { assignedTo: { $in: memberIds } }
            ]
        });

        // Process each task
        for (const task of tasks) {
            const taskCreatorId = task.createdBy.toString();

            // Members to remove from assignedTo and taskPosition
            const membersToRemove = memberIds.map(id => id.toString());

            // A) Remove members from assignedTo if they didn't create the task
            if (!membersToRemove.includes(taskCreatorId)) {
                task.assignedTo = task.assignedTo.filter(userId => !membersToRemove.includes(userId.toString()));
                task.taskPosition = task.taskPosition.filter(pos => !membersToRemove.includes(pos.userId.toString()));
            }
            // B) If they created the task and others are assigned, just remove them from assignedTo
            else if (membersToRemove.includes(taskCreatorId) && task.assignedTo.length > 1) {
                task.assignedTo = task.assignedTo.filter(userId => !membersToRemove.includes(userId.toString()));
                task.taskPosition = task.taskPosition.filter(pos => !membersToRemove.includes(pos.userId.toString()));
            }
            // C) If they created the task and are the only one assigned, leave it as is
            // No action needed

            // Save changes to each task
            await task.save();
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating tasks for removed members:', error);
        return { success: false, error };
    }
};



module.exports = { updateTasksForRemovedMembers };