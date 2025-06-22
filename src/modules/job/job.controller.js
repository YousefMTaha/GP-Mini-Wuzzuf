import { Router } from "express";
import * as JV from "./job.validation.js";
import * as JS from "./job.service.js";
import { isAuthenticate } from "../../middleware/auth.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error/async-handler.js";
import {
  cloudUpload,
  fileValidation,
} from "../../utils/file upload/multer-cloud.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { roles } from "../../DB/models/user.model.js";

const router = Router({ mergeParams: true });

router.post(
  "/add/:id",
  // isValid(JV.addJob),
  isAuthenticate,
  asyncHandler(JS.addJob)
);

router.patch(
  "/:id",
  // isValid(JV.updateJob),
  isAuthenticate,
  asyncHandler(JS.updateJob)
);

router.delete(
  "/:id",
  // isValid(JV.deleteJob),
  isAuthenticate,
  asyncHandler(JS.deleteJob)
);

router.post(
  "/apply/:id",
  isAuthenticate,
  isAuthorized(roles.USER),
  // isValid(JV.applyJob),
  cloudUpload(fileValidation.files).single("CV"),
  asyncHandler(JS.applyJob)
);

router.get("/filter", isAuthenticate, asyncHandler(JS.filterJobs));

router.get(
  "/getJobApplications/:id",
  // isValid(JV.getJobCompany),
  isAuthenticate,
  asyncHandler(JS.getJobApplications)
);

router.post(
  "/handle-application/:id",
  isAuthenticate,
  asyncHandler(JS.handleApplication)
);

router.get(
  "/application-status/:jobId",
  isAuthenticate,
  asyncHandler(JS.getApplicationStatus)
);

router.patch(
  "/change-application-status/:jobId",
  isAuthenticate,
  asyncHandler(JS.changeApplicationStatus)
);

router.get("/:jobId?", isAuthenticate, asyncHandler(JS.getCompanyJobs));

export default router;
