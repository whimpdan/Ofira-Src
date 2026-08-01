import mongoose from "mongoose";

const userPremiumSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  credits: { type: Number, required: true, default: 0 },
});

export default mongoose.model("UserPremium", userPremiumSchema);