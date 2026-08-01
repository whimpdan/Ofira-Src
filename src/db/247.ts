import mongoose from "mongoose";

const reconnectAuto = new mongoose.Schema({
  GuildId: { type: String, required: true },
  TextId: { type: String, required: true },
  VoiceId: { type: String, required: true },
});
export default mongoose.model("autoreconnect", reconnectAuto);
