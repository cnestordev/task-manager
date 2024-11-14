import axiosInstance from "../services/axiosInstance";

export const checkServerHealth = async () => {
    try {
        const { data } = await axiosInstance.get('/healthcheck');
        if (data.status === 200) {
            return true;
        } else {
            console.warn("Server health check failed with status:", data?.status);
            return false;
        }
    } catch (error) {
        console.error("Error during server health check:", error);
        return false;
    }
};
