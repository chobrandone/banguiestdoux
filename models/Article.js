const mongoose = require('mongoose');
const slugify  = require('slugify');

const articleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    titleFr:     String,
    slug:        { type: String, unique: true },
    excerpt:     { type: String, required: true },
    excerptFr:   String,
    content:     { type: String, required: true },
    contentFr:   String,
    category:    { type: String, enum: ['news','culture','nightlife','gastronomy','travel','lifestyle','interview','guide','other'], required: true },
    image:       { type: String, required: true },
    gallery:     [String],
    author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags:        [String],
    isFeatured:  { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    readTime:    { type: Number, default: 5 },
    views:       { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

articleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  /* Auto-calculate read time from content length */
  if (this.isModified('content')) {
    const words = this.content.split(' ').length;
    this.readTime = Math.ceil(words / 200);
  }
  next();
});

articleSchema.index({ category: 1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ views: -1 });

module.exports = mongoose.model('Article', articleSchema);
