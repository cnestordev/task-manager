const Joi = require('joi');
const mongoose = require('mongoose');

const teamValidationSchema = Joi.object({
    teamName: Joi.string().required().min(3).max(50).messages({
        "string.empty": "Team name cannot be empty",
        "string.min": "Team name must be at least 3 characters long",
        "string.max": "Team name must be less than or equal to 50 characters",
        "any.required": "Team name is required"
    }),
});

const inviteCodeValidationSchema = Joi.object({
    inviteCode: Joi.string().alphanum().length(8).required().messages({
        "string.empty": "Invite code cannot be empty",
        "string.alphanum": "Invite code must contain only alphanumeric characters",
        "string.length": "Invite code must be exactly 8 characters long",
        "any.required": "Invite code is required"
    }),
    teamId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.message("teamId must be a valid ObjectId");
            }
            return value;
        })
        .required()
        .messages({
            "string.empty": "Team ID cannot be empty",
            "any.required": "Team ID is required"
        })
});

// Middleware for validating team creation requests
const validateTeam = (req, res, next) => {
    const { error } = teamValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

// Middleware for validating invite code updates
const validateInviteCode = (req, res, next) => {
    const { error } = inviteCodeValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = {
    validateTeam,
    validateInviteCode
};
