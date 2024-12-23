const { default: mongoose } = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const generateInviteCode = require("../util/inviteCode");
const { updateTasksForRemovedMembers } = require('../util/teamTaskUtils');
const { demoTeamInviteCode } = require('../util/teamConstants');

const createResponse = (statusCode, error, users = []) => ({
    statusCode,
    error,
    users,
});

// Team Creation Handler
exports.createTeam = async (req, res) => {
    try {
        const { teamName } = req.body;
        const userId = req.user._id;
        const isDemoUser = req.user.isDemoUser;

        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!teamName) {
            return res.status(401).json({ error: 'Team name is required' });
        }

        if (isDemoUser) {
            return res.status(400).json({ error: 'Demo accounts cannot create new teams' });
        }

        // Check if the user already belongs to a team
        const user = await User.findById(userId);
        if (user.team) {
            return res.status(400).json({
                error: "User already belongs to a team. A user can only create or belong to one team."
            });
        }

        // Check if a team with the same name already exists
        const existingTeam = await Team.findOne({ name: teamName });
        if (existingTeam) {
            return res.status(400).json({ error: 'Team name already exists' });
        }

        // Create the team
        const newTeam = new Team({
            name: teamName,
            createdBy: userId,
            members: [userId],
            inviteCode: generateInviteCode()
        });
        await newTeam.save();

        // Link the team to the user and fetch updated user with team populated
        user.team = newTeam._id;
        await user.save();
        const updatedUser = await User.findById(userId).populate('team', 'name inviteCode createdBy members _id');

        return res.status(201).json({
            message: "Team created successfully",
            team: {
                id: newTeam._id,
                _id: newTeam._id,
                name: newTeam.name,
                inviteCode: newTeam.inviteCode,
                createdBy: userId,
                members: [userId]
            },
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                _id: updatedUser._id,
                darkMode: updatedUser.darkMode,
                theme: updatedUser.theme,
                isDemoUser: updatedUser.isDemoUser,
                isAdmin: updatedUser.isAdmin,
                avatarUrl: updatedUser.avatarUrl
            }
        });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ error: "An error occurred while creating the team" });
    }
};

// Get team detailsj
exports.getTeamDetails = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Find the user's team by populated members
        const user = await User.findById(req.user._id).populate('team');
        if (!user.team) {
            return res.status(404).json({ error: 'User does not belong to a team' });
        }

        const team = await Team.findById(user.team._id).populate('members', 'username');
        return res.status(200).json({
            id: team._id,
            _id: team._id,
            name: team.name,
            inviteCode: team.inviteCode,
            createdBy: team.createdBy,
            members: team.members.map(member => ({
                _id: member._id,
                username: member.username
            })),
        });
    } catch (error) {
        console.error('Error retrieving team details:', error);
        return res.status(500).json({ error: 'An error occurred while retrieving team details' });
    }
};

// Get team members
exports.getTeamMembers = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            // Fetch the user's team information
            const user = await User.findById(req.user._id).populate('team');

            // Check if the user belongs to a team
            if (!user.team) {
                return res.status(200).json(createResponse(200, 'User is not part of a team', []));
            }

            // Find all team members by team ID, excluding the current user
            const members = await User.find({ team: user.team._id, _id: { $ne: req.user._id } })
                .select('_id username avatarUrl');

            // Return the list of team members
            return res.status(200).json(createResponse(200, 'Team members fetched successfully', members));
        } else {
            return res.status(401).json({ error: 'User not authenticated' });
        }

    } catch (err) {
        console.error('Error fetching team members:', err);
        return res.status(500).json(createResponse(500, 'Internal server error', []));
    }
};

exports.editInviteCode = async (req, res) => {
    try {
        const { teamId, inviteCode } = req.body;
        const userId = req.user._id;

        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if both teamId and inviteCode are provided
        if (!teamId || !inviteCode) {
            return res.status(400).json({ error: 'Team ID and invite code are required' });
        }

        if (inviteCode === demoTeamInviteCode) {
            return res.status(400).json({ error: 'Demo invite code cannot be changed' });
        }

        // Check for an existing invite code to prevent duplicates
        const existingTeam = await Team.findOne({ inviteCode });

        if (existingTeam) {
            if (existingTeam._id.toString() === teamId) {
                // The invite code belongs to this team already
                return res.status(400).json({ error: 'Invite code is already set to this value for your team.' });
            } else {
                // The invite code belongs to a different team
                return res.status(409).json({ error: 'Invite code is already in use by another team.' });
            }
        }

        // Locate the team by teamId
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if the user is the admin of the team
        if (team.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only the team admin can edit the invite code' });
        }

        // Update the invite code and save the team
        team.inviteCode = inviteCode;
        await team.save();

        return res.status(200).json({ message: 'Invite code updated successfully', inviteCode });
    } catch (error) {
        console.error('Error updating invite code:', error);
        return res.status(500).json({ error: 'An error occurred while updating the invite code' });
    }
};

// Remove a team member
exports.removeMember = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user._id.toString();
        const { memberId } = req.body;
        const memberIdStr = memberId.toString();
        const isDemoUser = req.user.isDemoUser;

        if (isDemoUser) {
            return res.status(404).json({ error: 'Demo users cannot be removed from teams' });
        }

        // Find the team that includes the member to be removed
        const team = await Team.findOne({ members: memberId });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if the user is the team admin or the member themselves
        const isAdmin = team.createdBy.toString() === userId;
        const isSelfRemoval = userId === memberIdStr;

        if (!isAdmin && !isSelfRemoval) {
            return res.status(403).json({ error: 'Only the team admin or the member themselves can remove this member' });
        }

        // Ensure the member to be removed exists in the team
        if (!team.members.some(member => member.toString() === memberIdStr)) {
            return res.status(404).json({ error: 'Member not found in the team' });
        }

        // If the admin is removing themselves, remove all members and delete the team
        if (isAdmin && isSelfRemoval) {
            // Get all member IDs before removing them
            const teamMemberIds = team.members.map(member => member.toString());

            // Clear the `team` field from all members in the team
            await User.updateMany({ team: team._id }, { $set: { team: null } });

            // Delete the team
            await Team.findByIdAndDelete(team._id);

            // Update tasks for all members
            const taskUpdateResult = await updateTasksForRemovedMembers(teamMemberIds, team._id);
            if (!taskUpdateResult.success) {
                return res.status(500).json({ error: 'Error updating tasks for removed members' });
            }

            return res.status(200).json({
                message: 'Admin removed themselves; team and all members removed successfully',
                team: null,
            });
        }

        // Regular member removal case
        team.members = team.members.filter(member => member.toString() !== memberIdStr);
        await team.save();

        // Unlink the team from the removed member's profile
        await User.findByIdAndUpdate(memberId, { team: null });

        // Remove user from team related tasks
        const taskUpdateResult = await updateTasksForRemovedMembers([memberIdStr], team._id);
        if (!taskUpdateResult.success) {
            return res.status(500).json({ error: 'Error updating tasks for removed member' });
        }

        // Check if the team has no more members and delete if necessary
        if (team.members.length === 0) {
            await Team.findByIdAndDelete(team._id);
            return res.status(200).json({
                message: 'Member removed and team deleted as it has no more members',
            });
        }

        return res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing team member:', error);
        return res.status(500).json({ error: 'An error occurred while removing the member' });
    }
};

// Join a team using an invite code
exports.joinTeam = async (req, res) => {
    const session = await mongoose.startSession(); // Start a session for transactions
    try {
        session.startTransaction();

        const { inviteCode } = req.body;
        const userId = req.user._id;
        const isDemoUser = req.user.isDemoUser;

        if (!inviteCode) {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        if (isDemoUser && inviteCode !== demoTeamInviteCode) {
            return res.status(400).json({ error: 'Demo user cannot join non-demo teams' });
        } else if (!isDemoUser && inviteCode === demoTeamInviteCode) {
            return res.status(400).json({ error: 'Cannot join a demo team' });
        }

        const user = await User.findById(userId).session(session);
        if (user.team) {
            return res.status(400).json({ error: 'User already belongs to a team' });
        }

        const team = await Team.findOne({ inviteCode }).session(session);
        if (!team) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        if (team.members.includes(userId)) {
            return res.status(400).json({ error: 'User already in the team' });
        }

        // Add the user to the team and update the user's team reference
        team.members.push(userId);
        user.team = team._id;

        await team.save({ session });
        await user.save({ session });

        await session.commitTransaction();

        const updatedUser = await User.findById(userId).populate('team', 'name inviteCode createdBy members _id');

        return res.status(200).json({
            message: 'Successfully joined the team',
            team: {
                id: team._id,
                _id: team._id,
                name: team.name,
                inviteCode: team.inviteCode,
                createdBy: team.createdBy,
                members: team.members,
            },
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                _id: updatedUser._id,
                darkMode: updatedUser.darkMode,
                theme: updatedUser.theme,
                isDemoUser: updatedUser.isDemoUser,
                isAdmin: updatedUser.isAdmin,
                avatarUrl: updatedUser.avatarUrl
            }
        });
    } catch (error) {
        console.error('Error joining team:', error);
        await session.abortTransaction();
        return res.status(500).json({ error: 'An error occurred while attempting to join the team' });
    } finally {
        session.endSession();
    }
};