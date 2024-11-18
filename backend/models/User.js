const mongoose = require('mongoose');
const { THEMES } = require('../util/themeConstants');

// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  isAdmin: { type: Boolean, default: false },
  darkMode: { type: Boolean, default: false },
  avatarUrl: { type: String, required: false, default: null },
  theme: { type: String, required: false, default: THEMES.BLUE}
});

// Pre-save hook to ensure username is stored as lowercase
UserSchema.pre('save', function (next) {
  this.username = this.username.toLowerCase();
  next();
});

// Exclude password when converting to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;