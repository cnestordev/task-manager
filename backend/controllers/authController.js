const User = require('../models/User');
const Team = require("../models/Team");
const argon2 = require('argon2');
const passport = require('passport');

const createResponse = (statusCode, message, user = null, sessionID = null) => ({
    statusCode,
    message,
    user,
    sessionID,
});

// Registration Handler with Auto Login
exports.register = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json(createResponse(400, 'Username and password are required'));
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json(createResponse(400, 'Username already exists'));
        }

        // Hash the password and create the new user
        const passwordHash = await argon2.hash(password);
        const newUser = new User({ username: username.toLowerCase(), passwordHash });
        await newUser.save();

        // Log the user in
        req.login(newUser, async (err) => {
            if (err) {
                return next(err);
            }

            return res.status(201).json(createResponse(201, 'Registration and login successful', {
                id: newUser._id,
                username: newUser.username,
            }));
        });
    } catch (error) {
        return res.status(500).json(createResponse(500, 'Error registering user'));
    }
};


// Login Handler
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(createResponse(401, info.message || 'Invalid credentials'));

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                res.status(200).json(createResponse(200, 'Login successful', {
                    id: user._id,
                    username: user.username.toLowerCase(),
                }));
            } catch (err) {
                console.error('Error fetching tasks:', err);
                res.status(500).json(createResponse(500, 'Internal server error', null));
            }
        });
    })(req, res, next);
};


// Check if User is Logged In
exports.checkUser = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = {
                id: req.user._id,
                username: req.user.username.toLowerCase(),
            };
            return res.status(200).json(createResponse(200, 'User is authenticated', user));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json(createResponse(500, 'Internal server error', null));
        }
    } else {
        return res.status(401).json(createResponse(401, 'User not authenticated'));
    }
};

exports.getAllUsers = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            // Fetch all users except the current user
            const users = await User.find({ _id: { $ne: req.user._id } }).select('username');

            // Return the list of users
            return res.status(200).json(createResponse(200, 'Users fetched successfully', users));
        } catch (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json(createResponse(500, 'Internal server error', null));
        }
    } else {
        return res.status(401).json(createResponse(401, 'User not authenticated'));
    }
};

// Team Creation Handler
exports.createTeam = async (req, res) => {
    const { teamName } = req.body;
    const userId = req.user._id;

    if (!teamName) {
        return res.status(400).json(createResponse(400, 'Team name is required'));
    }

    try {
        // Check if a team with the same name already exists
        const existingTeam = await Team.findOne({ name: teamName });
        if (existingTeam) {
            return res.status(400).json(createResponse(400, 'Team name already exists'));
        }

        // Generate a unique invite code
        const inviteCode = Math.random().toString(36).substring(2, 10);

        // Create the team
        const team = new Team({
            name: teamName,
            createdBy: userId,
            members: [userId],
            inviteCode: inviteCode,
        });
        await team.save();

        // Update the user with the new team ID
        await User.findByIdAndUpdate(userId, { team: team._id });

        return res.status(201).json(createResponse(201, 'Team created successfully', {
            teamId: team._id,
            inviteCode: team.inviteCode,
            name: team.name,
            createdBy: team.createdBy,
        }));
    } catch (error) {
        return res.status(500).json(createResponse(500, 'Error creating team'));
    }
};

// Logout Handler
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json(createResponse(500, 'Error logging out'));

        req.session.destroy((err) => {
            if (err) return res.status(500).json(createResponse(500, 'Error destroying session'));

            res.clearCookie('connect.sid');
            return res.status(200).json(createResponse(200, 'Logged out successfully'));
        });
    });
};