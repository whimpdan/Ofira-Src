import mongoose from "mongoose";

const ignoreChannelSchema = new mongoose.Schema({
  GuildId: { type: String, required: true, unique: true },
  IgnoredChannels: { type: [String], default: [] },
});

export default mongoose.model("IgnoreChannel", ignoreChannelSchema);
