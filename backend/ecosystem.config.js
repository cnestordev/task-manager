module.exports = {
    apps: [
        {
            name: "task-app",
            script: "./server.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: 3000
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
