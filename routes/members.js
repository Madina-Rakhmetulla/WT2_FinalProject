const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember
} = require("../controllers/memberController");

const router = express.Router();

router.get("/", getMembers);
router.get("/:id", getMember);

router.post("/", auth, requireAdmin, createMember);
router.put("/:id", auth, requireAdmin, updateMember);
router.delete("/:id", auth, requireAdmin, deleteMember);

module.exports = router;
