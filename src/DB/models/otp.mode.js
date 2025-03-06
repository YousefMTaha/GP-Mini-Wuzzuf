import { Schema, model } from "mongoose";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresIn: 1 }, { expireAfterSeconds: 300 });

const otpModel = model("OTP", otpSchema);
export default otpModel;
