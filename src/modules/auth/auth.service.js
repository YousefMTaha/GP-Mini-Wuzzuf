import Randomstring from "randomstring";
import bcrypt, { compareSync } from "bcrypt";
import cron from "node-cron";
import { OAuth2Client } from "google-auth-library";
import userModel, { otpTypes, providers } from "../../DB/models/user.model.js";
import { generateToken } from "../../utils/token/generate-token.js";
import { verifyToken } from "../../utils/token/verify-token.js";
import { emailEvent } from "../../utils/email/email-event.js";
import otpModel from "../../DB/models/otp.mode.js";

cron.schedule("0 */6 * * *", async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await userModel.updateMany(
    { "OTP.expiresIn": { $lt: sixHoursAgo } },
    { $pull: { OTP: { expiresIn: { $lt: sixHoursAgo } } } }
  );
});

export const sendOTP = async (req, res, next) => {
  // get data from req
  const { email } = req.body;

  // check user existence
  const userExist = await userModel.findOne({ email }); //{} | null
  if (userExist) return next(new Error("User already exist", { cause: 409 }));

  const otp = Randomstring.generate({ length: 5, charset: "numeric" });
  // delete all related OTPs
  await otpModel.deleteMany({ email });
  // save to db
  await otpModel.create({ email, otp });
  // send to mail
  emailEvent.emit("sendEmail", email, "Confirm Your Email", otp);

  return res.status(200).json({
    success: true,
    message: "otp sent successfully",
  });
};

export const register = async (req, res, next) => {
  // get data from req
  const { email, otp } = req.body;
  // check otp
  const otpExist = await otpModel.findOne({ email, otp });
  if (!otpExist) return next(new Error("wrong otp"));
  // create
  req.body.isConfirmed = true;
  const createdUser = await userModel.create(req.body);

  await otpExist.deleteOne();
  // send success response
  return res.status(200).json({
    success: true,
    message: "user created successfully",
    data: createdUser,
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

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: generateToken({ payload: { email } }),
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
