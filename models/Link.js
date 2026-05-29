const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    dltHeader: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

linkSchema.index({ originalUrl: 1, dltHeader: 1 }, { unique: true });

module.exports = mongoose.model('Link', linkSchema);
