const Author = require("../models/Author");

async function createAuthor(req, res) {
  const fullName = String(req.body.fullName || "").trim();
  const birthYear = req.body.birthYear === "" || req.body.birthYear === undefined ? undefined : Number(req.body.birthYear);

  if (!fullName) return res.status(400).json({ message: "fullName is required" });

  const author = await Author.create({ fullName, birthYear });
  return res.status(201).json(author);
}

async function getAuthors(req, res) {
  const authors = await Author.find().sort({ createdAt: -1 });
  return res.json(authors);
}

async function getAuthor(req, res) {
  const author = await Author.findById(req.params.id);
  if (!author) return res.status(404).json({ message: "Author not found" });
  return res.json(author);
}

async function updateAuthor(req, res) {
  const fullName = String(req.body.fullName || "").trim();
  const birthYear = req.body.birthYear === "" || req.body.birthYear === undefined ? undefined : Number(req.body.birthYear);

  if (!fullName) return res.status(400).json({ message: "fullName is required" });

  const updated = await Author.findByIdAndUpdate(
    req.params.id,
    { fullName, birthYear },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Author not found" });
  return res.json(updated);
}

async function deleteAuthor(req, res) {
  const deleted = await Author.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Author not found" });
  return res.json({ message: "Deleted", _id: deleted._id });
}

module.exports = { createAuthor, getAuthors, getAuthor, updateAuthor, deleteAuthor };
