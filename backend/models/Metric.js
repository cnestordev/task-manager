const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
    value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const MetricSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    cpuUsage: [UsageSchema],
    memoryUsage: [UsageSchema],
    environment: { type: String, enum: ['production', 'development'], required: true },
});

const Metric = mongoose.model('Metric', MetricSchema);

module.exports = Metric;
