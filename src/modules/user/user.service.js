import bcrypt from "bcrypt";
import { encrypt } from "../../utils/crypto/encryption.js";
import cloudinary from "../../utils/file upload/cloud-config.js";
import userModel, { status } from "../../DB/models/user.model.js";
import { cloudinaryFolders } from "../../utils/cloudFolders.js";
import { generateToken } from "../../utils/token/generate-token.js";
import { verifyToken } from "../../utils/token/verify-token.js";
import otpModel from "../../DB/models/otp.mode.js";
import { emailEvent } from "../../utils/email/email-event.js";
import Randomstring from "randomstring";

export const updateUser = async (req, res, next) => {
  const { user } = req;

  if (req.body.mobileNumber) {
    req.body.mobileNumber = encrypt({ data: req.body.mobileNumber });
  }

  req.body.updatedBy = req.user._id;

  await user.updateOne(req.body);

  const newUser = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, msg: "updated", user: newUser });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await userModel.findById(req.user._id, { password: 1 });

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return next(new Error("invalid old password", { cause: 400 }));
  }

  user.password = newPassword;
  user.status = status.offline;
  user.changeCredentialTime = new Date();
  await user.save();
  res.status(200).json({ success: true, msg: "done" });
};

export const freezeAccount = async (req, res, next) => {
  // req.user.deletedAt = Date.now();
  await req.user.deleteOne();
  res.status(200).json({ success: true, msg: "done" });
};

export const getLoginUserData = async (req, res, next) => {
  res.status(200).json({ success: true, msg: "done", user: req.user });
};

export const getAnotherUserData = async (req, res, next) => {
  const user = await userModel
    .findOne({ _id: req.params.id, deletedAt: { $exists: false } })
    .select("firstName lastName mobileNumber email profilePic coverPic");

  return user
    ? res.status(200).json({ success: true, msg: "done", user })
    : next(new Error("user not exist ", { cause: 404 }));
};

export const uploadProfilePic = async (req, res, next) => {
  if (req.user.profilePic?.public_id) {
    await cloudinary.uploader.destroy(req.user.profilePic.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: cloudinaryFolders(req.user._id).userProfilePic,
    }
  );
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      profilePic: { secure_url, public_id },
    },
    { new: true }
  );
  return res.json({ success: true, data: user });
};

export const uploadCoverPic = async (req, res, next) => {
  if (req.user.coverPic?.public_id)
    await cloudinary.uploader.destroy(req.user.coverPic.public_id);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: cloudinaryFolders(req.user._id).userCoverPic,
    }
  );

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      coverPic: { secure_url, public_id },
    },
    { new: true }
  );

  return res.json({ success: true, data: user });
};

export const deleteProfilePic = async (req, res, next) => {
  const { user } = req;

  if (!user.profilePic?.public_id)
    return next(new Error("no profile pic exist", { cause: 404 }));

  await cloudinary.uploader.destroy(user.profilePic.public_id);
  user.profilePic = null;
  await user.save();
  return res.json({ success: true, message: "Done" });
};

export const deleteCoverPic = async (req, res, next) => {
  const { user } = req;

  if (!user.coverPic?.public_id)
    return next(new Error("no cover pic exist", { cause: 404 }));

  await cloudinary.uploader.destroy(user.coverPic.public_id);
  user.coverPic = null;
  await user.save();
  return res.json({ success: true, message: "Done" });
};

export const checkPasswordChangeEmail = async (req, res, next) => {
  const { password } = req.body;

  const user = await userModel.findById(req.user._id).select("password");

  if (!bcrypt.compareSync(password, user.password)) {
    return next(new Error("invalid password", { cause: 400 }));
  }

  const token = generateToken({
    payload: { userId: req.user._id },
  });

  return res.json({ success: true, token });
};

export const sendOTP = async (req, res, next) => {
  const { email, token } = req.body;
  try {
    const { userId } = verifyToken({ token });

    if (userId.toString() != req.user._id.toString()) {
      return next(new Error("invalid token userId", { cause: 400 }));
    }

    const userExist = await userModel.findOne({ email }); //{} | null

    if (userExist) return next(new Error("User already exist", { cause: 409 }));

    const otp = Randomstring.generate({ length: 5, charset: "numeric" });
    await otpModel.deleteMany({ email });
    await otpModel.create({ email, otp });
    emailEvent.emit("sendEmail", email, "Confirm Your new Email", otp);

    return res.status(200).json({
      success: true,
      message: "otp sent successfully",
    });
  } catch (error) {
    return next(new Error(error.message, { cause: 400 }));
  }
};

export const changeEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const checkOTP = await otpModel.findOne({ email, otp });

  if (!checkOTP)
    return next(new Error("invalid OTP or OTP expired", { cause: 400 }));

  await checkOTP.deleteOne();

  await req.user.updateOne({ email, status: status.offline });

  return res.json({ success: true, message: "Done" });
};

export const logout = async (req, res, next) => {
  await req.user.updateOne({ status: status.offline });
  return res.status(200).json({ success: true, message: "Done" });
};
