const mongoose = require("mongoose");

const judgesSchema = new mongoose.Schema({
  email: { type: String, required: true },
  channel_name: { type: String, required: true },
  judges: { type: [String], required: true },
  topic: { type: String, required: true }, 
  agenda: { type: String, required: true }, 
  created_at: { type: Date, default: Date.now },
  unique_id: { type: String }, // Optional or remove if not used
});

module.exports = mongoose.model("Judges", judgesSchema);
