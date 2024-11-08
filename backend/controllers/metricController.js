const Metric = require("../models/Metric");

exports.getMetrics = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const environment = process.env.NODE_ENV;

            const latestMetric = await Metric.findOne({ environment })
                .sort({ timestamp: -1 });  // Sort by `timestamp` in descending order


            return res.status(200).json({ status: 200, metrics: latestMetric });
        } catch (err) {
            console.error('Error fetching metrics:', err);
            return res.status(500).json({ status: 500, data: null });
        }
    } else {
        return res.status(401).json({ status: 401, data: null });
    }
};