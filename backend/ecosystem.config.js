module.exports = {
    apps: [
        {
            name: "task-app",
            script: "./server.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            max_memory_restart: "300M",
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: process.env.PORT
            },
            env_production: {
                NODE_ENV: "production",
                PORT: process.env.PORT
            }
        },
        {
            name: "cleanup-script",
            script: "./cleanupjob.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};
