import mongoose from "mongoose";

const premiumServerSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  activatedBy: { type: String, required: true },
  activationDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true },
});

export default mongoose.model("PremiumServer", premiumServerSchema);
