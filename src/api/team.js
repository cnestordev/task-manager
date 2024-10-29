import axiosInstance from '../services/axiosInstance';

// Fetch team details
export const getTeamDetails = async () => {
    const response = await axiosInstance.get('/team');
    return response.data;
};

// Create a Team
export const createTeam = async (teamName) => {
    const response = await axiosInstance.post('/team/createTeam', { teamName });
    return response;
};

// Remove a team member by ID
export const removeMember = async (memberId) => {
    const response = await axiosInstance.delete(`/team/members/${memberId}`);
    return response.data;
};