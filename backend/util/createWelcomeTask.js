const Task = require("../models/Task");

const createWelcomeTask = async (userId, options = {}) => {
    const { title = 'Welcome Task', description = 'This is a sample task to get you started!' } = options;

    try {
        const welcomeTask = new Task({
            title,
            description,
            createdBy: userId,
            assignedTo: [userId],
            teamId: null,
            taskPosition: [{
                priority: 'High',
                position: 0,
                userId,
            }],
            private: true
        });

        await welcomeTask.save();
        return welcomeTask;
    } catch (error) {
        console.error('Error creating welcome task:', error);
        throw new Error('Failed to create welcome task');
    }
};

module.exports = createWelcomeTask;
