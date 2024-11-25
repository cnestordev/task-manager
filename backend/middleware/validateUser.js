const Joi = require('joi');
const { THEMES } = require('../util/themeConstants');

// Base schema for username and password
const baseSchema = {
    username: Joi.string().required().min(3).max(30),
    password: Joi.string().required().min(3),
    isDemoUser: Joi.boolean().required().default(false)
};

// Login Validation Schema
const loginValidationSchema = Joi.object(baseSchema);

// Generate an array of valid theme values from the THEMES object
const validThemes = Object.values(THEMES);

// Task Validation Schema
const taskValidationSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).max(1024).required(),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    theme: Joi.string().valid(...validThemes).optional(),
    isDeleted: Joi.boolean().default(false),
    isExpanded: Joi.boolean().default(true),
    avatarUrl: Joi.string().uri().optional(),
});


// Registration Validation Schema
const userValidationSchema = Joi.object({
    ...baseSchema,
    tasks: Joi.array().items(taskValidationSchema).default([])
});

const validateLogin = (req, res, next) => {
    const { error } = loginValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

const validateUser = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = {
    validateLogin,
    validateUser
};
