const Metric = require('./models/Metric');

const AUTH_TOKEN = process.env.RENDER_API_KEY;
const resource = process.env.RENDER_RESOURCE;

async function storeMetrics(metrics) {
    try {
        await Metric.create(metrics);
        console.log("Metrics stored successfully for timestamp:", metrics.timestamp);
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
        const startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const cpuUrl = `https://api.render.com/v1/metrics/cpu?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&resolutionSeconds=300&resource=${resource}`;
        const memoryUrl = `https://api.render.com/v1/metrics/memory?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&resolutionSeconds=300&resource=${resource}`;

        const cpuData = await fetchMetricData(cpuUrl);
        const memoryData = await fetchMetricData(memoryUrl);

        const cpuUsage = cpuData[0]?.values.map(entry => ({
            value: parseFloat(entry.value.toFixed(2)),
            timestamp: new Date(entry.timestamp),
        })) || [];

        const memoryUsage = memoryData[0]?.values.map(entry => ({
            value: (entry.value / 1024 / 1024).toFixed(2), // convert to MB
            timestamp: new Date(entry.timestamp),
        })) || [];

        if (cpuUsage.length && memoryUsage.length) {
            const metrics = {
                appName: 'task-api',
                cpuUsage,
                memoryUsage,
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
