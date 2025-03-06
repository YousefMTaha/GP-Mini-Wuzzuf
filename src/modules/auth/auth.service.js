import Randomstring from "randomstring";
import bcrypt, { compareSync } from "bcrypt";
import cron from "node-cron";
import { OAuth2Client } from "google-auth-library";
import userModel, { otpTypes, providers } from "../../DB/models/user.model.js";
import { compare } from "../../utils/hash/compare.js";
import { generateToken } from "../../utils/token/generate-token.js";
import { verifyToken } from "../../utils/token/verify-token.js";
import { emailEvent } from "../../utils/email/email-event.js";

cron.schedule("0 */6 * * *", async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await userModel.updateMany(
    { "OTP.expiresIn": { $lt: sixHoursAgo } },
    { $pull: { OTP: { expiresIn: { $lt: sixHoursAgo } } } }
  );
});

export const signup = async (req, res, next) => {
  const { email } = req.body;

  const userExist = await userModel.findOne({ email });
  if (userExist) return next(new Error("User already exists", { cause: 409 }));

  const otp = Randomstring.generate({ length: 5, charset: "numeric" });
  const hashedOTP = await bcrypt.hash(otp, 10);

  await userModel.create({
    ...req.body,
    OTP: [
      {
        code: hashedOTP,
        type: otpTypes.CONFIRM_EMAIL,
        expiresIn: new Date(Date.now() + 10 * 60 * 1000),
      },
    ],
  });

  emailEvent.emit("sendEmail", email, "Verify your email", otp);

  return res.status(200).json({
    success: true,
    message: "Signup successful. Please verify your email with the OTP sent.",
  });
};

// check
export const confirmOtp = async (req, res, next) => {
  const { email, otp, otpType } = req.body;

  const user = await userModel.findOne({
    email,
    "OTP.type": otpType,
    "OTP.expiresIn": { $gt: new Date() },
  });

  if (!user) {
    return next(new Error("No OTP found or OTP expired"));
  }

  const otpRecord = user.OTP.find((o) => o.type === otpType);

  if (!bcrypt.compareSync(otp, otpRecord.code)) {
    return next(new Error("Invalid OTP"));
  }

  if (otpType === otpTypes.CONFIRM_EMAIL) {
    user.isConfirmed = true;
  }

  user.OTP = user.OTP.filter((o) => o.expiresIn < new Date());
  await user.save();

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
    provider: providers.SYSTEM,
  });

  if (!user || !compareSync(password, user.password))
    return next(new Error("Invalid credentials", { cause: 401 }));

  if (!user.isConfirmed) {
    return next(new Error("Please confirm your email first", { cause: 400 }));
  }

  if (user.bannedAt) {
    return next(new Error("Your account is banned by admin", { cause: 400 }));
  }

  if (user.deletedAt) {
    await user.updateOne({ $unset: { deletedAt: 1 } });
  }

  const accessToken = generateToken({
    payload: { email },
    options: { expiresIn: "1h" },
  });

  const refreshToken = generateToken({
    payload: { email },
    options: { expiresIn: "7d" },
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  const result = verifyToken({ token: refreshToken });
  if (result.error) return next(result.error);

  const user = await userModel.findOne({ email: result.email });
  if (
    user.changeCredentialTime &&
    new Date(user.changeCredentialTime) > new Date(result.iat * 1000)
  ) {
    return next(
      new Error("Token expired due to credential change, please login again", {
        cause: 401,
      })
    );
  }

  const accessToken = generateToken({
    payload: { email: result.email },
    options: { expiresIn: "1h" },
  });

  return res.status(200).json({ success: true, accessToken });
};

const verifyGoogleToken = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  return ticket.getPayload();
};

export const googleLoginOrSignup = async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, picture } = await verifyGoogleToken(idToken);

  let user = await userModel.findOne({
    email,
    provider: providers.GOOGLE,
  });

  if (!user) {
    user = await userModel.create({
      userName: name,
      email,
      profilePic: { secure_url: picture, public_id: "" },
      provider: providers.GOOGLE,
      isConfirmed: true,
    });
  }

  const accessToken = generateToken({
    payload: { email },
    options: { expiresIn: "1h" },
  });

  const refreshToken = generateToken({
    payload: { email },
    options: { expiresIn: "7d" },
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
  });
};

export const sendOtpForgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  const otp = Randomstring.generate({ length: 5, charset: "numeric" });

  user.OTP.push({
    code: bcrypt.hashSync(otp, 10),
    type: otpTypes.FORGET_PASSWORD,
    expiresIn: new Date(Date.now() + 10 * 60 * 1000),
  });
  await user.save();

  emailEvent.emit("sendEmail", email, "Reset Password", otp);

  return res.status(200).json({
    success: true,
    message: "Reset password OTP sent successfully",
  });
};

export const confirmForgetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await userModel.findOne({
    email,
    "OTP.type": otpTypes.FORGET_PASSWORD,
    "OTP.expiresIn": { $gt: new Date() },
  });

  if (!user || !user.OTP.length) {
    return next(new Error("OTP expired or not found"));
  }

  const otpRecord = user.OTP.find((o) => o.type === otpTypes.FORGET_PASSWORD);

  if (!bcrypt.compareSync(otp, otpRecord.code)) {
    return next(new Error("Invalid OTP"));
  }

  user.password = password;
  user.changeCredentialTime = new Date();
  user.OTP = user.OTP.filter((o) => o.type !== otpTypes.FORGET_PASSWORD);
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};
