import { Router } from "express";
import * as UV from "./user.validation.js";
import * as userService from "./user.service.js";
import { isAuthenticate } from "../../middleware/auth.middleware.js";
import {
  cloudUpload,
  fileValidation,
} from "../../utils/file upload/multer-cloud.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error/async-handler.js";

const userRouter = Router();

userRouter.patch(
  "/",
  isValid(UV.updateUser),
  isAuthenticate,
  asyncHandler(userService.updateUser)
);

userRouter.patch(
  "/updatePass",
  isValid(UV.updatePassword),
  isAuthenticate,
  asyncHandler(userService.updatePassword)
);

userRouter.delete("/", isAuthenticate, asyncHandler(userService.freezeAccount));

userRouter.get("/", isAuthenticate, asyncHandler(userService.getLoginUserData));

userRouter.get(
  "/:id",
  isValid(UV.getProfile),
  asyncHandler(userService.getAnotherUserData)
);

userRouter.patch(
  "/profile-pic",
  isAuthenticate,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(userService.uploadProfilePic)
);

userRouter.delete(
  "/profile-pic",
  isAuthenticate,
  asyncHandler(userService.deleteProfilePic)
);

userRouter.patch(
  "/cover-pic",
  isAuthenticate,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(userService.uploadCoverPic)
);

userRouter.delete(
  "/cover-pic",
  isAuthenticate,
  asyncHandler(userService.deleteCoverPic)
);

userRouter.post(
  "/checkPasswordChangeEmail",
  isAuthenticate,
  asyncHandler(userService.checkPasswordChangeEmail)
);

userRouter.post("/sendOTP", isAuthenticate, asyncHandler(userService.sendOTP));

userRouter.post(
  "/changeEmail",
  isAuthenticate,
  asyncHandler(userService.changeEmail)
);

userRouter.post("/logout", isAuthenticate, asyncHandler(userService.logout));
export default userRouter;
