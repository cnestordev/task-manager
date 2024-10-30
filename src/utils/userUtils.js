import { getTeamMembers } from '../api';

export const getListOfUsers = async () => {
    try {
        const { data: { user: users } } = await getTeamMembers();
        return users;
    } catch (err) {
        console.log(err);
    }
};