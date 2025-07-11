import { Router } from "express";
import { isAuthenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error/async-handler.js";
import {
  addInterviewSummary,
  getInterviewSummary,
  getInterviewSummaryByJobId,
} from "./interview.service.js";

const interviewRouter = Router();

interviewRouter.post(
  "/:jobId",
  isAuthenticate,
  asyncHandler(addInterviewSummary)
);

interviewRouter.get(
  "/interview/:jobId",
  isAuthenticate,
  asyncHandler(getInterviewSummaryByJobId)
);

interviewRouter.get(
  "/:jobId",
  isAuthenticate,
  asyncHandler(getInterviewSummary)
);

export default interviewRouter;
