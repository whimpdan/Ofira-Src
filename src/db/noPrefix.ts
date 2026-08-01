import mongoose from "mongoose";

const NoPrefixSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  expiresAt: { type: Date, default: null },
  lifetime: { type: Boolean, default: false },
});

export default mongoose.model("noPrefix", NoPrefixSchema);
