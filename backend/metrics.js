const pm2 = require('pm2');
const Metric = require('./models/Metric');

async function storeMetrics(metrics) {
    try {
        await Metric.create(metrics);
    } catch (err) {
        console.error("Error storing metrics:", err);
    }
}

async function checkResourceUsage() {
    try {
        await new Promise((resolve, reject) => pm2.connect((err) => (err ? reject(err) : resolve())));

        const processList = await new Promise((resolve, reject) => pm2.list((err, list) => (err ? reject(err) : resolve(list))));
        const environment = process.env.NODE_ENV || 'development';

        // Loop through processes to check and store metrics
        for (const process of processList) {
            const cpuUsagePercent = process.monit.cpu;
            const memoryUsageMB = (process.monit.memory / 1024 / 1024).toFixed(2);

            if (process.name === "task-app") {
                const metrics = {
                    appName: process.name,
                    cpuUsage: cpuUsagePercent,
                    memoryUsage: parseFloat(memoryUsageMB),
                    environment: environment
                };

                await storeMetrics(metrics);  // Store metrics in Mongo
            }
        }
    } catch (err) {
        console.error("Error in checkResourceUsage:", err);
        throw err;
    } finally {
        // Disconnect pm2
        pm2.disconnect();
    }
}

module.exports = checkResourceUsage;
