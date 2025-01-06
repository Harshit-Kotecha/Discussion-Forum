const express = require("express");
const Judges = require("../models/judges");

const router = express.Router();

// Add judges
router.post("/", async (req, res) => {
  try {
    const { email, channel_name, judges, topic, agenda } = req.body;

    if (!channel_name || !judges || !Array.isArray(judges)) {
      return res
        .status(400)
        .json({ message: "Invalid input. All fields are required." });
    }

    // Check if the channel_name already exists
    const existingChannel = await Judges.findOne({ channel_name });
    if (existingChannel) {
      return res
        .status(400)
        .json({ message: "Channel name already exists." });
    }

    // Create and save the new judges entry
    const newJudges = new Judges({
      email,
      channel_name,
      judges,
      topic: topic || "", // Default to an empty string if not provided
      agenda: agenda || "", // Default to an empty string if not provided
    });
    await newJudges.save();

    res
      .status(201)
      .json({ message: "Judges added successfully.", data: newJudges });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get judges by channel id
router.get("/", async (req, res) => {
  try {
    const { channel_name } = req.query;

    if (!channel_name) {
      return res.status(400).json({ message: "channel_name is required." });
    }

    // Fetch the judges entry
    const judgesEntry = await Judges.findOne({ channel_name });
    if (!judgesEntry) {
      return res
        .status(404)
        .json({ message: "No judges found for the given channel_name." });
    }

    res.status(200).json(judgesEntry);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;