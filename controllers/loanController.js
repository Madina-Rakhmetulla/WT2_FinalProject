const Loan = require("../models/Loan");
const Member = require("../models/Member");
const Book = require("../models/Book");

async function getLoans(req, res) {
  const loans = await Loan.find()
    .sort({ borrowedAt: -1 })
    .populate({ path: "member", select: "firstName lastName email country gender" })
    .populate({ path: "book", populate: { path: "author", select: "fullName" } });

  return res.json(loans);
}

async function createLoan(req, res) {
  const memberId = req.body.memberId;
  const bookId = req.body.bookId;

  if (!memberId || !bookId) {
    return res.status(400).json({ message: "memberId and bookId are required" });
  }

  const member = await Member.findById(memberId);
  if (!member) return res.status(404).json({ message: "Member not found" });

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  const existingActive = await Loan.findOne({ book: bookId, returnedAt: null });
  if (existingActive) {
    return res.status(409).json({ message: "This book is already on loan" });
  }

  const loan = await Loan.create({ member: memberId, book: bookId });
  const populated = await Loan.findById(loan._id)
    .populate({ path: "member", select: "firstName lastName email country gender" })
    .populate({ path: "book", populate: { path: "author", select: "fullName" } });

  return res.status(201).json(populated);
}

async function returnLoan(req, res) {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  if (loan.returnedAt) {
    return res.status(400).json({ message: "Loan is already returned" });
  }

  loan.returnedAt = new Date();
  await loan.save();

  const populated = await Loan.findById(loan._id)
    .populate({ path: "member", select: "firstName lastName email country gender" })
    .populate({ path: "book", populate: { path: "author", select: "fullName" } });

  return res.json(populated);
}

async function deleteLoan(req, res) {
  const loan = await Loan.findByIdAndDelete(req.params.id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  return res.json({ message: "Loan deleted" });
}

module.exports = { getLoans, createLoan, returnLoan, deleteLoan };
