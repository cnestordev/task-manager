import axiosInstance from "../services/axiosInstance";

// Get User tasks
export const getTasks = async (user) => {
    const response = await axiosInstance.get(`/task/${user.id}`);
    return response;
};

export const createTask = async (task) => {
    const response = await axiosInstance.post('/task/create', task);
    return response;
};

export const updateTaskOrder = async (task) => {
    const response = await axiosInstance.post('/task/updateTaskOrder', task);
    return response;
};

export const updateTasksServer = async (tasks) => {
    const response = await axiosInstance.post('/task/updateTasks', tasks);
    return response;
};

export const updateTasksOrderOnServer = async (tasks) => {
    const response = await axiosInstance.post('/task/updateTasksOrderOnServer', tasks);
    return response;
};

export const addCommentToTask = async (taskId, text) => {
    const response = await axiosInstance.post('/task/addCommentToTask', {
        taskId,
        text
    });
    return response;
};

export const removeCommentFromTask = async (comment) => {
    const response = await axiosInstance.post(`/task/removeCommentFromTask`, comment);
    return response;
};

export const getTaskComments = async (taskId) => {
    const response = await axiosInstance.get(`/task/getTaskComments/${taskId}`);
    return response;
};