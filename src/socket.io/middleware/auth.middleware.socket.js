import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const { authorization } = socket.handshake.headers;

    if (!authorization) return next(new Error("token required"));

    if (!authorization.startsWith("Bearer")) {
      return res
        .status(400)
        .json({ success: false, message: "invalid bearer key" });
    }

    const token = authorization.split(" ")[1]; // [Bearer,token]

    const { email } = jwt.verify(token, process.env.SECRET_JWT);

    const user = await userModel.findOne({ email }, { password: 0 }); // {} | null
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.deletedAt) {
      return next(
        new Error("your account is deleted plz login again to activate it")
      );
    }

    socket.user = user;
    socket.id = user._id;

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
