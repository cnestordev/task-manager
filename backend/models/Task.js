const mongoose = require('mongoose');
const Comment = require('./Comment');

// Task Schema
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    taskPosition: [{
        priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
        position: { type: Number, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        _id: false
    }],
    isCompleted: { type: Boolean, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { versionKey: '__v' });  // Explicitly set version key to `__v`

// Middleware to update the modified field before updating the document
TaskSchema.pre('findOneAndUpdate', function (next) {
    this.set({ modified: Date.now() });
    next();
});

// Method for updating with optimistic locking
TaskSchema.statics.updateTaskWithLock = async function (id, updateData, currentVersion) {
    const result = await this.findOneAndUpdate(
        { _id: id, __v: currentVersion },  // Check current version
        { ...updateData, $inc: { __v: 1 } },  // Increment version
        { new: true }
    );
    return result;
};

TaskSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const filter = this.getQuery();

    const isSoftDelete =
        (update && update.isDeleted === true) ||
        (update.$set && update.$set.isDeleted === true);

    if (isSoftDelete) {

        try {
            await Comment.deleteMany({ taskId: filter._id });
        } catch (err) {
            console.error("Error deleting associated comments:", err);
            return next(err);
        }
    }

    this.set({ modified: Date.now() });

    next();
});

TaskSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.modified;
        return ret;
    }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;