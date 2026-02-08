const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    birthYear: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
