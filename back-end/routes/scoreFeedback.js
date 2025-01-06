const express = require("express");
const ScoreFeedback = require("../models/scoreFeedback");

const router = express.Router();

// Add a new score and feedback
router.post("/", async (req, res) => {
  try {
    const { email, channel_name, score, feedback } = req.body;

    if (!email || !channel_name || !score || !feedback) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = new ScoreFeedback({ email, channel_name, score, feedback });
    await newEntry.save();

    res.status(201).json({ message: "Feedback submitted successfully", data: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all feedback for a channel
router.get("/", async (req, res) => {
    try {
      const { email, channel_name } = req.query;
  
      // Build the filter object dynamically based on query parameters
      const filter = {};
      if (email) filter.email = email;
      if (channel_name) filter.channel_name = channel_name;
  
      const feedbackList = await ScoreFeedback.find(filter);
  
      res.status(200).json(feedbackList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

module.exports = router;
