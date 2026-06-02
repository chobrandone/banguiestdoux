const mongoose = require('mongoose');
const slugify  = require('slugify');

const talentSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    slug:       { type: String, unique: true },
    title:      { type: String, required: true },
    titleFr:    String,
    bio:        { type: String, required: true },
    bioFr:      String,
    category:   { type: String, enum: ['artist','musician','entrepreneur','influencer','athlete','creator','chef','other'], required: true },
    image:      { type: String, required: true },
    coverImage: String,
    gallery:    [String],
    videoUrl:   String,
    instagram:  String,
    facebook:   String,
    twitter:    String,
    youtube:    String,
    isFeatured: { type: Boolean, default: false },
    isPublished:{ type: Boolean, default: true },
    tags:       [String],
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

talentSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Talent', talentSchema);
