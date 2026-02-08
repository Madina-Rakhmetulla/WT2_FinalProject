const Book = require("../models/Book");
const Author = require("../models/Author");

async function createBook(req, res) {
  const title = String(req.body.title || "").trim();
  const year = req.body.year === "" || req.body.year === undefined ? undefined : Number(req.body.year);
  const author = String(req.body.author || "").trim();

  if (!title) return res.status(400).json({ message: "title is required" });
  if (!author) return res.status(400).json({ message: "author is required" });

  const authorExists = await Author.findById(author);
  if (!authorExists) return res.status(400).json({ message: "author not found" });

  const book = await Book.create({ title, year, author });
  return res.status(201).json(book);
}

async function getBooks(req, res) {
  const books = await Book.find()
    .populate("author", "fullName birthYear")
    .sort({ createdAt: -1 });
  return res.json(books);
}

async function getBook(req, res) {
  const book = await Book.findById(req.params.id).populate("author", "fullName birthYear");
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.json(book);
}

async function updateBook(req, res) {
  const title = String(req.body.title || "").trim();
  const year = req.body.year === "" || req.body.year === undefined ? undefined : Number(req.body.year);
  const author = String(req.body.author || "").trim();

  if (!title) return res.status(400).json({ message: "title is required" });
  if (!author) return res.status(400).json({ message: "author is required" });

  const authorExists = await Author.findById(author);
  if (!authorExists) return res.status(400).json({ message: "author not found" });

  const updated = await Book.findByIdAndUpdate(
    req.params.id,
    { title, year, author },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Book not found" });
  return res.json(updated);
}

async function deleteBook(req, res) {
  const deleted = await Book.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Book not found" });
  return res.json({ message: "Deleted", _id: deleted._id });
}

module.exports = { createBook, getBooks, getBook, updateBook, deleteBook };
