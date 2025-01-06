const express = require("express");
const User = require("../models/user");

const router = express.Router();

// Get user name by email
router.get("/full-name", async (req, res) => {
  try {
    const { email } = req.query;

    // Validate request
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with user name
    res.status(200).json({ name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;