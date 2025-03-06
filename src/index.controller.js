import companyRoutes from "./modules/company/company.controller.js";
import jobRoutes from "./modules/job/job.controller.js";
import { dbConnection } from "./DB/dbConnection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalError } from "./utils/error/global-error.js";
import { notFound } from "./utils/error/not-found.js";
import adminRouter from "./modules/Admin/restAPI/admin.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import { adminGraphqlSchema } from "./modules/Admin/graphql/admin.graphql.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

export const bootstrap = (app, express) => {
  app.use(express.json());

  app.use(helmet());
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  });

  app.use(limiter);

  dbConnection();

  app.use(
    "/graphql",
    createHandler({
      schema: adminGraphqlSchema,
      context: (req) => ({ req }),
    })
  );

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/companies", companyRoutes);
  app.use("/jobs", jobRoutes);
  app.use("/admins", adminRouter);

  app.use("*", notFound);

  app.use(globalError);
};
