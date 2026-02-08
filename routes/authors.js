const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createAuthor,
  getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor
} = require("../controllers/authorController");

const router = express.Router();

// Public read
router.get("/", getAuthors);
router.get("/:id", getAuthor);

// Admin write
router.post("/", auth, requireAdmin, createAuthor);
router.put("/:id", auth, requireAdmin, updateAuthor);
router.delete("/:id", auth, requireAdmin, deleteAuthor);

module.exports = router;
