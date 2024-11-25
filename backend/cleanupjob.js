require("./config/loadEnv");
const connectDB = require("./config/db");
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const Task = require("./models/Task");
const User = require("./models/User");
const checkResourceUsage = require("./metrics");

connectDB();

// Create a task that clears orphaned tasks every 15 minutes and logs CPU usage
const task = new AsyncTask(
    "cleanupjob",
    async () => {
        try {
            // Step 1: Perform the cleanup operation for unassigned tasks
            await Task.deleteMany({ assignedTo: { $eq: [] } });
            console.log("Successfully deleted unassigned tasks.");

            // Step 2: Fetch demo users created more than 24 hours ago
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const demoUsers = await User.find({
                isDemoUser: true,
                createdAt: { $lt: twentyFourHoursAgo },
            });

            console.log(`Found ${demoUsers.length} demo users to clean up.`);

            // Step 3: For each demo user, delete their tasks and the user
            for (const user of demoUsers) {
                const userId = user._id;

                // Delete the user's tasks
                const deletedTasks = await Task.deleteMany({ createdBy: userId });
                console.log(
                    `Deleted ${deletedTasks.deletedCount} tasks for demo user ${userId}.`
                );

                // Delete the user
                await User.deleteOne({ _id: userId });
                console.log(`Deleted demo user ${userId}.`);
            }

            // Step 4: Monitor CPU Resource Usage
            try {
                await checkResourceUsage();
                console.log("Resource usage checked successfully.");
            } catch (cpuError) {
                console.error("Error during resource usage check:", cpuError);
            }
        } catch (error) {
            console.error("Error occurred during the cleanup task:", error);
        }
    },
    (err) => {
        console.error("Error occurred in cleanup task:", err);
    }
);

// Initialize the scheduler
const scheduler = new ToadScheduler();

// Define the job with a 60-minute interval
const job = new SimpleIntervalJob({ minutes: 60 }, task);

// Start the job
const startJob = () => {
    scheduler.addSimpleIntervalJob(job);
    console.log("Cleanup job started.");
};

startJob();

module.exports = { startJob };
