const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
    group: { type: String, default: 'general' },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);

/* Helper to get a setting */
Setting.get = async (key) => {
  const s = await Setting.findOne({ key });
  return s ? s.value : null;
};

/* Helper to set a setting */
Setting.set = async (key, value, group = 'general') => {
  return Setting.findOneAndUpdate({ key }, { value, group }, { upsert: true, new: true });
};

module.exports = Setting;
