const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

LoanSchema.virtual("isActive").get(function () {
  return !this.returnedAt;
});

module.exports = mongoose.model("Loan", LoanSchema);
