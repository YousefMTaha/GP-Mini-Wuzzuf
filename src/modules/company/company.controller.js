import { Router } from "express";
import * as CV from "./company.validation.js";
import * as companyService from "./company.service.js";
import { isAuthenticate } from "../../middleware/auth.middleware.js";
import { roles } from "../../DB/models/user.model.js";
import { isValid } from "../../middleware/validation.middleware.js";
import {
  cloudUpload,
  fileValidation,
} from "../../utils/file upload/multer-cloud.js";
import { asyncHandler } from "../../utils/error/async-handler.js";
import jobRouter from "../job/job.controller.js";
const router = Router();

router.use("/:companyId/jobs", jobRouter);

router.post(
  "/",
  isAuthenticate,
  // isValid(CV.addCompany),
  asyncHandler(companyService.addCompany)
);

router.get(
  "/userCompanies",
  isAuthenticate,
  asyncHandler(companyService.getUserCompanies)
);

router.get(
  "/search",
  isValid(CV.getCompanyByName),
  isAuthenticate,
  asyncHandler(companyService.getCompanyByName)
);

router.patch(
  "/uploadCompanyLogo/:id",
  isValid(CV.uploadPic),
  isAuthenticate,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(companyService.uploadCompanyLogo)
);

router.patch(
  "/uploadCompanyCoverPic/:id",
  // isValid(CV.uploadPic),
  isAuthenticate,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(companyService.uploadCompanyCoverPic)
);

router.delete(
  "/deleteCompanyLogo/:id",
  isValid(CV.deleteCompanyPic),
  isAuthenticate,
  asyncHandler(companyService.deleteCompanyLogo)
);

router.delete(
  "/deleteCompanyCoverPic/:id",
  isValid(CV.deleteCompanyPic),
  isAuthenticate,
  asyncHandler(companyService.deleteCompanyCoverPic)
);

router.get(
  "/:id",
  isValid(CV.getCompany),
  isAuthenticate,
  asyncHandler(companyService.getCompany)
);

router.delete(
  "/:id",
  isValid(CV.deleteCompany),
  isAuthenticate,
  asyncHandler(companyService.deleteCompany)
);

router.patch(
  "/:id",
  isValid(CV.updateCompany),
  isAuthenticate,
  asyncHandler(companyService.updateCompany)
);

export default router;
