import { Schema, model, Types } from "mongoose";

const chatSchema = new Schema(
  {
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const chatModel = model("Chat", chatSchema);
export default chatModel;
