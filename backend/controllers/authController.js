const User = require('../models/User');
const Team = require("../models/Team");
const argon2 = require('argon2');
const passport = require('passport');
const createAssetsObject = require('../util/avatarUtils');
const { THEMES } = require('../util/themeConstants');
const createWelcomeTask = require('../util/createWelcomeTask');

const createResponse = (statusCode, message, user = null, sessionID = null) => ({
    statusCode,
    message,
    user,
    sessionID,
});

// Registration Handler with Auto Login
exports.register = async (req, res, next) => {
    const { username, password, isDemoUser } = req.body;

    try {
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json(createResponse(400, 'Username already exists'));
        }

        const passwordHash = await argon2.hash(password);
        const newUser = new User({ username: username.toLowerCase(), passwordHash, isDemoUser });
        await newUser.save();

        req.login(newUser, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                await createWelcomeTask(newUser._id);
            } catch (taskError) {
                console.error('Failed to create welcome task:', taskError);
            }

            return res.status(201).json(createResponse(201, 'Registration and login successful', {
                id: newUser._id,
                username: newUser.username,
                darkMode: newUser.darkMode,
                theme: newUser.theme,
                team: null,
                avatarUrl: null,
                isDemoUser: newUser.isDemoUser
            }));
        });
    } catch (error) {
        return res.status(500).json(createResponse(500, 'Error registering user', { error: error.message }));
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
                // Populate the user's team details if they belong to one
                const populatedUser = await User.findById(user._id).populate('team', 'name inviteCode createdBy members _id');

                const assets = await createAssetsObject(populatedUser.team);

                res.status(200).json(createResponse(200, 'Login successful', {
                    id: populatedUser._id,
                    username: populatedUser.username.toLowerCase(),
                    isAdmin: populatedUser.isAdmin,
                    darkMode: populatedUser.darkMode,
                    theme: populatedUser.theme,
                    avatarUrl: populatedUser.avatarUrl,
                    isDemoUser: populatedUser.isDemoUser,
                    team: populatedUser.team
                        ? {
                            id: populatedUser.team._id,
                            name: populatedUser.team.name,
                            inviteCode: populatedUser.team.inviteCode,
                            createdBy: populatedUser.team.createdBy,
                            members: populatedUser.team.members,
                            assets: assets
                        }
                        : null // Set team to null if the user is not part of a team
                }));
            } catch (err) {
                console.error('Error fetching user or team data:', err);
                res.status(500).json(createResponse(500, 'Internal server error', null));
            }
        });
    })(req, res, next);
};

// Check if User is Logged In
exports.checkUser = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.findOne({ _id: req.user._id })
                .populate('team', 'createdBy name inviteCode members');

            // If the user has a team, fetch avatars for team members
            let assets = await createAssetsObject(user.team);

            const modifiedUser = {
                username: user.username,
                isAdmin: user.isAdmin,
                darkMode: user.darkMode,
                theme: user.theme,
                avatarUrl: user.avatarUrl,
                _id: user._id,
                id: user._id,
                isDemoUser: user.isDemoUser,
                team: user.team ? {
                    _id: user.team._id,
                    createdBy: user.team.createdBy,
                    name: user.team.name,
                    inviteCode: user.team.inviteCode,
                    members: user.team.members,
                    assets: assets,
                } : null
            };

            return res.status(200).json(createResponse(200, 'User is authenticated', modifiedUser));
        } catch (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json(createResponse(500, 'Internal server error', null));
        }
    } else {
        return res.status(401).json(createResponse(401, 'User not authenticated'));
    }
};

// Toggle Dark Mode
exports.toggleDarkMode = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json(createResponse(401, 'User not authenticated'));
        }
        const userId = req.user._id;

        // Find the user by ID
        const user = await User.findById(userId);

        // If user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle darkMode
        user.darkMode = !user.darkMode;

        // Save the updated user record
        await user.save();

        res.status(200).json({ message: 'Dark mode toggled successfully', darkMode: user.darkMode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle Theme
exports.toggleTheme = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json(createResponse(401, 'User not authenticated'));
        }
        const userId = req.user._id;

        // Find the user by ID
        const user = await User.findById(userId);

        // If user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle darkMode
        user.theme = req?.body?.theme || THEMES.BLUE;

        // Save the updated user record
        await user.save();

        res.status(200).json({ message: 'Theme updated successfully', theme: user.theme });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload avatar image
exports.uploadImage = async (req, res) => {
    const imageUrl = req?.file?.path || null;

    if (!imageUrl) {
        return res.status(502).json({ message: 'An error occurred updating your image' });
    }

    try {
        // Update the user's avatarUrl field
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { avatarUrl: imageUrl },
            { new: true }
        ).populate('team', 'createdBy name inviteCode members');

        // Check if the user was found and updated
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize an empty assets object
        let assets = await createAssetsObject(updatedUser.team);

        // Construct the modifiedUser object to send to the client
        const modifiedUser = {
            username: updatedUser.username,
            isAdmin: updatedUser.isAdmin,
            darkMode: updatedUser.darkMode,
            theme: updatedUser.theme,
            avatarUrl: updatedUser.avatarUrl,
            _id: updatedUser._id,
            id: updatedUser._id,
            isDemoUser: updatedUser.isDemoUser,
            team: updatedUser.team ? {
                _id: updatedUser.team._id,
                createdBy: updatedUser.team.createdBy,
                name: updatedUser.team.name,
                inviteCode: updatedUser.team.inviteCode,
                members: updatedUser.team.members,
                assets: assets
            } : null
        };

        res.status(200).json({ user: modifiedUser });
    } catch (err) {
        res.status(500).send({ message: 'Server error', error: err });
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