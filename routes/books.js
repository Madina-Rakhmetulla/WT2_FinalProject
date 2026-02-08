const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook
} = require("../controllers/bookController");

const router = express.Router();

// Public read
router.get("/", getBooks);
router.get("/:id", getBook);

// Admin write
router.post("/", auth, requireAdmin, createBook);
router.put("/:id", auth, requireAdmin, updateBook);
router.delete("/:id", auth, requireAdmin, deleteBook);

module.exports = router;
