const mongoose = require('mongoose');
const slugify  = require('slugify');

const openingHoursSchema = new mongoose.Schema({ day: String, open: String, close: String, closed: { type: Boolean, default: false } }, { _id: false });
const menuItemSchema     = new mongoose.Schema({ name: String, description: String, price: Number, category: String, image: String }, { _id: false });
const reviewSchema       = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: { type: Number, min: 1, max: 5 }, comment: String, createdAt: { type: Date, default: Date.now } });

const restaurantSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true },
    description: { type: String, required: true },
    descriptionFr: String,
    category:    { type: String, enum: ['restaurant','bar','rooftop','lounge','fast-food','street-food','cafe','nightclub','other'], required: true },
    cuisine:     [String],
    address:     { type: String, required: true },
    phone:       String,
    email:       String,
    website:     String,
    instagram:   String,
    facebook:    String,
    reservationUrl: String,
    image:       { type: String, required: true },
    gallery:     [String],
    menu:        [menuItemSchema],
    openingHours:[openingHoursSchema],
    priceRange:  { type: Number, min: 1, max: 4, default: 2 },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews:     [reviewSchema],
    isFeatured:  { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    coordinates: { lat: Number, lng: Number },
    tags:        [String],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

restaurantSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

/* Recalculate rating on save */
restaurantSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.reviewCount = this.reviews.length;
    this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  }
  next();
});

restaurantSchema.index({ category: 1 });
restaurantSchema.index({ isFeatured: 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
