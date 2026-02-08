const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    country: { type: String, required: true, trim: true },
    gender: { type: String, trim: true },
    hobbies: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
