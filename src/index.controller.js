import companyRoutes from "./modules/company/company.controller.js";
import jobRoutes from "./modules/job/job.controller.js";
import { dbConnection } from "./DB/dbConnection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalError } from "./utils/error/global-error.js";
import { notFound } from "./utils/error/not-found.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import interviewRouter from "./modules/interview/interview.controller.js";

export const bootstrap = (app, express) => {
  app.use(express.json());

  app.use(helmet());
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
  });

  app.use(limiter);

  dbConnection();

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/companies", companyRoutes);
  app.use("/jobs", jobRoutes);
  app.use("/interviews", interviewRouter);

  app.use("*", notFound);

  app.use(globalError);
};
