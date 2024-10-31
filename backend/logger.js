require("./config/loadEnv");
const connectDB = require("./config/db");
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const Task = require("./models/Task");

connectDB();

// Create a task that clears orphaned tasks every 15 minutes
const task = new AsyncTask(
    "logger-task",
    async () => {
        const data = await Task.deleteMany({ assignedTo: { $eq: [] } });
        console.log(data);
    },
    (err) => {
        console.error("Error occurred in logger task:", err);
    }
);

// const checkConnection = () => {
//     const status = mongoose.connection.readyState;
//     switch (status) {
//         case 0:
//             console.log("Mongoose is disconnected");
//             break;
//         case 1:
//             console.log("Mongoose is connected");
//             break;
//         case 2:
//             console.log("Mongoose is connecting");
//             break;
//         case 3:
//             console.log("Mongoose is disconnecting");
//             break;
//         default:
//             console.log("Unknown connection status");
//     }
// };




// Initialize the scheduler
const scheduler = new ToadScheduler();

// Define the job with a 15-second interval
const job = new SimpleIntervalJob({ minutes: 15 }, task);

// Function to start the job
const startJob = () => {
    scheduler.addSimpleIntervalJob(job);
    console.log("Logger job started.");
};

startJob();

module.exports = { startJob };
