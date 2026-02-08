const Member = require("../models/Member");

function validateMemberPayload(body) {
  const errors = [];
  if (!body.firstName || String(body.firstName).trim() === "") errors.push("firstName is required");
  if (!body.email || String(body.email).trim() === "") errors.push("email is required");
  if (!body.country || String(body.country).trim() === "") errors.push("country is required");
  return errors;
}

async function createMember(req, res) {
  const errors = validateMemberPayload(req.body);
  if (errors.length) return res.status(400).json({ message: "Validation error", errors });

  try {
    const created = await Member.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      country: req.body.country,
      gender: req.body.gender,
      hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : []
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getMembers(req, res) {
  try {
    const items = await Member.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getMember(req, res) {
  try {
    const item = await Member.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Member not found" });
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: "Invalid id", error: err.message });
  }
}

async function updateMember(req, res) {
  const errors = validateMemberPayload(req.body);
  if (errors.length) return res.status(400).json({ message: "Validation error", errors });

  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        country: req.body.country,
        gender: req.body.gender,
        hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : []
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Member not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Invalid id", error: err.message });
  }
}

async function deleteMember(req, res) {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Member not found" });
    return res.json({ message: "Deleted", _id: deleted._id });
  } catch (err) {
    return res.status(400).json({ message: "Invalid id", error: err.message });
  }
}

module.exports = { createMember, getMembers, getMember, updateMember, deleteMember };
