const mongoose = require('mongoose');
const slugify  = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    titleFr:      { type: String, trim: true },
    slug:         { type: String, unique: true },
    description:  { type: String, required: true },
    descriptionFr:{ type: String },
    category:     {
      type: String,
      enum: ['concerts','festivals','cinema','pool-parties','jazz-nights','sports','exhibitions','restaurant-openings','theatre','art','other'],
      required: true,
    },
    date:         { type: Date, required: true },
    endDate:      { type: Date },
    time:         { type: String },
    location:     { type: String, required: true },
    address:      { type: String },
    coordinates:  { lat: Number, lng: Number },
    image:        { type: String, required: true },
    gallery:      [String],
    video:        { type: String },
    ticketPrice:  { type: Number, default: 0 },
    ticketUrl:    { type: String },
    isFree:       { type: Boolean, default: false },
    isFeatured:   { type: Boolean, default: false },
    isPublished:  { type: Boolean, default: true },
    capacity:     { type: Number },
    rsvpCount:    { type: Number, default: 0 },
    rsvpUsers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags:         [String],
    organizer:    { type: String },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

/* Auto-generate slug */
eventSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

/* Auto-set isFree */
eventSchema.pre('save', function (next) {
  if (this.ticketPrice === 0) this.isFree = true;
  next();
});

eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ slug: 1 });

module.exports = mongoose.model('Event', eventSchema);
