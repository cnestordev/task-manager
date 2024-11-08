const Metric = require('./models/Metric');

const AUTH_TOKEN = process.env.RENDER_API_KEY;
const resource = process.env.RENDER_RESOURCE;

async function storeMetrics(metrics) {
    try {
        const existingMetric = await Metric.findOne({ timestamp: metrics.timestamp });

        if (!existingMetric) {
            await Metric.create(metrics);
        } else {
            console.log("Metric already exists for timestamp:", metrics.timestamp);
        }
    } catch (err) {
        console.error("Error storing metrics:", err);
    }
}

async function fetchMetricData(url) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: AUTH_TOKEN
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
}

async function checkResourceUsage() {
    try {
        const endTime = new Date().toISOString();
        const startTime = new Date(Date.now() - 20 * 60 * 1000).toISOString();

        const cpuUrl = `https://api.render.com/v1/metrics/cpu?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&resolutionSeconds=30&resource=${resource}`;
        const memoryUrl = `https://api.render.com/v1/metrics/memory?resolutionSeconds=60&resource=${resource}`;

        const cpuData = await fetchMetricData(cpuUrl);
        const memoryData = await fetchMetricData(memoryUrl);

        const latestCpuValue = cpuData[0]?.values.slice(-1)[0];
        const latestMemoryValue = memoryData[0]?.values.slice(-1)[0];

        if (latestCpuValue && latestMemoryValue) {
            const metrics = {
                appName: 'task-api',
                cpuUsage: latestCpuValue.value,
                memoryUsage: (latestMemoryValue.value / 1024 / 1024).toFixed(2),
                timestamp: new Date(latestCpuValue.timestamp),
                environment: process.env.NODE_ENV || 'development'
            };
            await storeMetrics(metrics);
        }
    } catch (err) {
        console.error("Error in checkResourceUsage:", err);
        throw err;
    }
}

module.exports = checkResourceUsage;
