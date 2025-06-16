const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;

// Custom validator for ObjectId
const objectIdValidator = (value, helpers) => {
    if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

// Task validation schema
const taskValidationSchema = Joi.object({
    _id: Joi.string().custom(objectIdValidator).optional(),
    title: Joi.string().required().min(1).max(255),
    description: Joi.string().required().min(1).max(1024),
    isDeleted: Joi.boolean().default(false),
    createdBy: Joi.string().custom(objectIdValidator).optional(),
    assignedTo: Joi.array().items(
        Joi.string().custom(objectIdValidator)
    ).optional(),
    teamId: Joi.string().custom(objectIdValidator).allow(null).optional(),
    created: Joi.date().optional(),
    modified: Joi.date().allow(null).optional(),
    taskPosition: Joi.array().items(
        Joi.object({
            isExpanded: Joi.boolean().default(true),
            priority: Joi.string().valid('Low', 'Medium', 'High').required(),
            position: Joi.number().integer().required(),
            userId: Joi.string().custom(objectIdValidator).optional(),
        })
    ).optional(),
    isCompleted: Joi.boolean().default(false),
    comments: Joi.array().items(
        Joi.object({
            taskId: Joi.string().custom(objectIdValidator).required(),
            createdBy: Joi.string().custom(objectIdValidator).required(),
            text: Joi.string().required().min(1).max(1000),
            createdAt: Joi.date().optional()
        })
    ).optional(),

    __v: Joi.number().integer().optional()
});

// Middleware for validating task payload
const validateTask = (req, res, next) => {
    const { error } = taskValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).json({ error: error.details.map(detail => detail.message).join(', ') });
    }
    next();
};

module.exports = validateTask;
