const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    cpuUsage: { type: Number, required: true },
    memoryUsage: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    environment: { type: String, enum: ['production', 'development'], required: true }
});

const Metric = mongoose.model('Metric', MetricSchema);

module.exports = Metric;
