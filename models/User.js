const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Le nom est requis'], trim: true, maxlength: [100, 'Nom trop long'] },
    email:    { type: String, required: [true, "L'email est requis"], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Email invalide'] },
    password: { type: String, required: [true, 'Le mot de passe est requis'], minlength: 6, select: false },
    role:     { type: String, enum: ['user','admin','superadmin'], default: 'user' },
    avatar:   { type: String },
    phone:    { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin:{ type: Date },
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
  },
  { timestamps: true }
);

/* Hash password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* Compare password */
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

/* Generate JWT */
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = mongoose.model('User', userSchema);
