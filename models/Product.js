const mongoose = require('mongoose');
const slugify  = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    nameFr:      String,
    slug:        { type: String, unique: true },
    description: { type: String, required: true },
    descriptionFr: String,
    category:    { type: String, enum: ['t-shirts','caps','tote-bags','glassware','accessories','limited-editions','other'], required: true },
    price:       { type: Number, required: true, min: 0 },
    comparePrice:{ type: Number },
    images:      { type: [String], required: true },
    sizes:       [String],
    colors:      [{ name: String, hex: String }],
    stock:       { type: Number, default: 0 },
    sku:         String,
    isFeatured:  { type: Boolean, default: false },
    isLimited:   { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    tags:        [String],
    weight:      Number,
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
