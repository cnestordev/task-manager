const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const Task = require("./models/Task")

// Create a task that logs a message every 15 seconds
const task = new AsyncTask(
    "logger-task",
    async () => {
        console.log("Logger is running every 3 seconds...");
        const data = await Task.deleteMany({ assignedTo: { $size: 0 } });
        console.log(data)
    },
    (err) => {
        console.error("Error occurred in logger task:", err);
    }
);



// Initialize the scheduler
const scheduler = new ToadScheduler();

// Define the job with a 15-second interval
const job = new SimpleIntervalJob({ seconds: 25 }, task);

// Function to start the job
const startJob = () => {
    scheduler.addSimpleIntervalJob(job);
    console.log("Logger job started.");
};


module.exports = { startJob };
