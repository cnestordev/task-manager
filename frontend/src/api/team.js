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

// Edit Invite Code
export const editInviteCode = async (payload) => {
    const response = await axiosInstance.post('/team/editInviteCode', payload);
    return response;
};

// Remove a team member by ID
export const removeMember = async (memberId) => {
    const response = await axiosInstance.post(`/team/members/remove`, { memberId });
    return response.data;
};

// Join team by invitation code
export const joinTeam = async (inviteCode) => {
    const response = await axiosInstance.post(`/team/join`, { inviteCode });
    return response.data;
};

// Get team members
export const getTeamMembers = async () => {
    const response = await axiosInstance.get('/team/allMembers');
    return response;
};