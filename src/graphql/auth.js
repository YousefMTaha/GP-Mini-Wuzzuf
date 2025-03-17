import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";

export const authenticate = (...roles) => {
  return async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("Token required");
    }
    if (!authHeader.startsWith("Bearer")) {
      throw new Error("Invalid bearer token");
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_JWT);
    } catch (error) {
      throw new Error("Invalid token");
    }
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.deletedAt) {
      throw new Error("Your account is deleted");
    }

    if (!roles.includes(user.role))
      throw new Error("not authorized!", { cause: 401 });

    return user;
  };
};
