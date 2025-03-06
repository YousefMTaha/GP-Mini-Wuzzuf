import { Router } from "express";
import * as authValidation from "./auth.validation.js";
import * as authService from "./auth.service.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error/async-handler.js";

const authRouter = Router();

authRouter.post(
  "/register",
  isValid(authValidation.register),
  asyncHandler(authService.register)
);
authRouter.post("/send-otp", asyncHandler(authService.sendOTP));

authRouter.post(
  "/login",
  isValid(authValidation.login),
  asyncHandler(authService.login)
);

authRouter.post(
  "/refresh-token",
  isValid(authValidation.refreshToken),
  asyncHandler(authService.refreshToken)
);

authRouter.post(
  "/google-login",
  isValid(authValidation.googleLoginOrSignup),
  asyncHandler(authService.googleLoginOrSignup)
);

authRouter.post(
  "/google-signup",
  isValid(authValidation.googleLoginOrSignup),
  asyncHandler(authService.googleLoginOrSignup)
);

authRouter.post(
  "/send-otp-forget-password",
  isValid(authValidation.sendOtpForgetPassword),
  asyncHandler(authService.sendOtpForgetPassword)
);

authRouter.post(
  "/forget-password",
  isValid(authValidation.confirmForgetPassword),
  asyncHandler(authService.confirmForgetPassword)
);

export default authRouter;
