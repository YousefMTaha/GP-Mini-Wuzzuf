import { Router } from "express";
import * as adminService from "./admin.service.js";
import { isAuthenticate } from "../../../middleware/auth.middleware.js";
import { isAuthorized } from "../../../middleware/authorization.middleware.js";
import { roles } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/error/async-handler.js";
const adminRouter = Router();

adminRouter.post(
  "/ban-unbanned-user/:id",
  isAuthenticate,
  isAuthorized(roles.ADMIN),
  asyncHandler(adminService.toggleUserBan)
);

adminRouter.post(
  "/ban-unbanned-company/:id",
  isAuthenticate,
  isAuthorized(roles.ADMIN),
  asyncHandler(adminService.toggleCompanyBan)
);

adminRouter.post(
  "/approve-company/:id",
  isAuthenticate,
  isAuthorized(roles.ADMIN),
  asyncHandler(adminService.approveCompany)
);

export default adminRouter;
