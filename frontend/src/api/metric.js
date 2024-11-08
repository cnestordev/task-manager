import axiosInstance from '../services/axiosInstance';

export const getMetricData = async () => {
    const response = await axiosInstance.get('/metrics/getMetrics');
    return response;
};