import { Schema, model, Types } from "mongoose";
import applicationModel from "./application.model.js";

export const jobLocations = {
  onsite: "onsite",
  remotely: "remotely",
  hybrid: "hybrid",
};

export const workingTimes = {
  PART_TIME: "part-time",
  FULL_TIME: "full-time",
};

export const seniorityLevels = {
  FRESH: "fresh",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-Level",
  SENIOR: "Senior",
  TEAM_LEAD: "Team-Lead",
  CTO: "CTO",
};

const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      required: true,
      enum: Object.values(jobLocations),
    },
    workingTime: {
      type: String,
      required: true,
      enum: Object.values(workingTimes),
    },
    seniorityLevel: {
      type: String,
      required: true,
      enum: Object.values(seniorityLevels),
    },
    jobDescription: {
      type: String,
      required: true,
      minlength: 50,
      trim: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.virtual("applications", {
  localField: "_id",
  foreignField: "jobId",
  ref: "Application",
});

jobSchema.pre("deleteOne", { document: true }, async function () {
  await applicationModel.deleteMany({ jobId: this._id });
});

jobSchema.pre("deleteMany", async function (next) {
  const jobs = await jobModel.find(this.getFilter());
  const jobIds = jobs.map((job) => job._id);

  await applicationModel.deleteMany({ jobId: { $in: jobIds } });
  next();
});

const jobModel = model("Job", jobSchema);
export default jobModel;
