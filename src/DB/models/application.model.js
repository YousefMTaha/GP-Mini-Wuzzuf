import { Schema, model, Types } from "mongoose";

export const applicationStatus = {
  APPLIED: "applied",
  INTERVIEWED: "interviewed",
};

const applicationSchema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCV: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(applicationStatus),
      default: applicationStatus.APPLIED,
    },
  },
  {
    timestamps: true,
  }
);

const applicationModel = model("Application", applicationSchema);
export default applicationModel;
