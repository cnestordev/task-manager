require("./config/loadEnv");
const connectDB = require("./config/db");
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const Task = require("./models/Task");
const checkResourceUsage = require("./metrics");

connectDB();

// Create a task that clears orphaned tasks every 15 minutes and logs CPU usage
const task = new AsyncTask(
    "cleanupjob",
    async () => {
        // Perform the cleanup operation
        const data = await Task.deleteMany({ assignedTo: { $eq: [] } });

        try {
            // CPU Monitoring Logic
            await checkResourceUsage();
        } catch (error) {
            console.log("Error during resource usage check", error)
        }
    },
    (err) => {
        console.error("Error occurred in cleanup task:", err);
    }
);

// Initialize the scheduler
const scheduler = new ToadScheduler();

// Define the job with a 15-minute interval
const job = new SimpleIntervalJob({ minutes: 15 }, task);

// Start the job
const startJob = () => {
    scheduler.addSimpleIntervalJob(job);
    console.log("Cleanup job started.");
};

startJob();

module.exports = { startJob };
