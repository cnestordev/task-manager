const User = require('../models/User');

// Utility function to create an assets object from team members
const createAssetsObject = async (team) => {
    const assets = {};

    if (team && team.members && team.members.length > 0) {
        // Fetch avatarUrl for each team member
        const teamMemberIds = team.members;
        const teamMembers = await User.find({ _id: { $in: teamMemberIds } }, 'avatarUrl');

        // Populate the assets object with userId and avatarUrl
        teamMembers.forEach(member => {
            assets[member._id] = member.avatarUrl;
        });
    }

    return assets;
};

module.exports = createAssetsObject;
