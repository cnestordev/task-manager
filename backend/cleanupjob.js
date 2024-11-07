require("./config/loadEnv");
const connectDB = require("./config/db");
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const Task = require("./models/Task");

connectDB();

// Create a task that clears orphaned tasks every 15 minutes and logs CPU usage
const task = new AsyncTask(
    "cleanupjob",
    async () => {
        // Perform the cleanup operation
        const data = await Task.deleteMany({ assignedTo: { $eq: [] } });
        console.log("Cleanup task result:", data);

        // CPU Monitoring Logic
        const currentCpuUsage = process.cpuUsage();
        const userCpuTime = currentCpuUsage.user / 1000;  // Convert to milliseconds
        const systemCpuTime = currentCpuUsage.system / 1000;  // Convert to milliseconds

        const cpuUsagePercent = ((userCpuTime + systemCpuTime) / 1000) * 100;  // approximation

        // Log CPU usage if it exceeds 20%
        if (cpuUsagePercent > 20) {
            console.log(`High CPU Usage during cleanup: ${cpuUsagePercent.toFixed(2)}%`);
        } else {
            console.log(`CPU Usage during cleanup: ${cpuUsagePercent.toFixed(2)}%`);
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
