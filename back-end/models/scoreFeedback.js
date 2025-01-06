const mongoose = require("mongoose");

const scoreFeedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  channel_name: { type: String, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScoreFeedback", scoreFeedbackSchema);
