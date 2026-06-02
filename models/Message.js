const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true },
    phone:   String,
    subject: String,
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    repliedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
