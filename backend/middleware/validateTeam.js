const Joi = require('joi');

const teamValidationSchema = Joi.object({
    teamName: Joi.string().required().min(3).max(50).messages({
        "string.empty": "Team name cannot be empty",
        "string.min": "Team name must be at least 3 characters long",
        "string.max": "Team name must be less than or equal to 50 characters",
        "any.required": "Team name is required"
    }),
});

// Middleware for validating team creation requests
const validateTeam = (req, res, next) => {
    const { error } = teamValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = {
    validateTeam,
};
