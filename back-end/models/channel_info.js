const ChannelInfo = new mongoose.Schema({
  created_by_email: [String], // Array of email strings
  channel_name: { type: String, required: true },
  id: { type: String, unique: true, default: mongoose.Types.ObjectId },
});
