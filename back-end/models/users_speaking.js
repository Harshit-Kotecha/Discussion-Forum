const mongoose = require("mongoose");

const speakingUsersSchema = new mongoose.Schema({
  channel_name: { type: String, required: true }, // The channel where the users are speaking
  users_speaking: { type: [String], required: true, default: [] }, // List of user names or IDs
  created_at: { type: Date, default: Date.now }, // Timestamp for record creation
});

module.exports = mongoose.model("SpeakingUsers", speakingUsersSchema);
