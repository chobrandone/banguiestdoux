const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title:     String,
    type:      { type: String, enum: ['image', 'video'], required: true },
    url:       { type: String, required: true },
    thumbnail: String,
    category:  { type: String, default: 'events' },
    event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    tags:      [String],
    isFeatured:{ type: Boolean, default: false },
    uploadedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
