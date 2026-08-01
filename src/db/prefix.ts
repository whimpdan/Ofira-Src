import mongoose from "mongoose";

const PrefixSchema = new mongoose.Schema({
  serverId: { type: String, required: true },
  prefix: { type: String, required: true },
});

export default mongoose.model("PREFIX", PrefixSchema);