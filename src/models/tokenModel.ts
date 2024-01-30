import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, expires: "1y", default: Date.now },
});

const Token = mongoose.model("Token", tokenSchema);
export { Token };
