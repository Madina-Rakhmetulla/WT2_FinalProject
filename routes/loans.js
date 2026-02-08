const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getLoans,
  createLoan,
  returnLoan,
  deleteLoan
} = require("../controllers/loanController");

const router = express.Router();

router.get("/", auth, requireAdmin, getLoans);
router.post("/", auth, requireAdmin, createLoan);
router.put("/:id/return", auth, requireAdmin, returnLoan);
router.delete("/:id", auth, requireAdmin, deleteLoan);

module.exports = router;
