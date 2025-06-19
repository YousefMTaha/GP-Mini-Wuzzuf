import { Schema, model, Types } from "mongoose";

const userType = {
  USER: "user",
  AI: "AI",
};

const interviewSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    jobId: {
      type: Types.ObjectId,
      required: true,
      ref: "Job",
    },
    chat: [
      {
        role: {
          type: String,
          required: true,
          enum: Object.values(userType),
        },
        content: {
          type: String,
          required: true,
        },
        _id: false,
      },
    ],
    summary: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 100,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const interviewModel = model("InterviewChat", interviewSchema);

export default interviewModel;
