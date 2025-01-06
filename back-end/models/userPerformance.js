const mongoose = require("mongoose");

const userPerformanceSchema = new mongoose.Schema({
  channelName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  relevance: { type: Number, required: true },
});

module.exports = mongoose.model("userPerformance", userPerformanceSchema);
