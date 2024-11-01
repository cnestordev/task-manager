module.exports = {
    apps: [
        {
            name: "task-app",
            script: "./server.js",
            instances: process.env.NODE_ENV === "production" ? "max" : 1, 
            exec_mode: process.env.NODE_ENV === "production" ? "cluster" : "fork",
            autorestart: true,
            watch: process.env.NODE_ENV !== "production"
        },
        {
            name: "cleanup-script",
            script: "./cleanupjob.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: process.env.NODE_ENV !== "production"
        }
    ]
};
