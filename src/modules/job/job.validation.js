import Joi from "joi";
import {
  jobLocations,
  workingTimes,
  seniorityLevels,
} from "../../DB/models/job.model.js";
import { generalFields } from "../../middleware/validation.middleware.js";
import { applicationStatus } from "../../DB/models/application.model.js";

export const addJob = Joi.object({
  jobTitle: Joi.string().trim().required(),
  jobLocation: Joi.string()
    .valid(...Object.values(jobLocations))
    .required(),
  workingTime: Joi.string()
    .valid(...Object.values(workingTimes))
    .required(),
  seniorityLevel: Joi.string()
    .valid(...Object.values(seniorityLevels))
    .required(),
  jobDescription: Joi.string().trim().min(50).required(),
  technicalSkills: Joi.array().items(Joi.string()).min(1).required(),
  softSkills: Joi.array().items(Joi.string()).min(1).required(),
  id: generalFields.id.required(),
});

export const updateJob = Joi.object({
  jobTitle: Joi.string().trim(),
  jobLocation: Joi.string().valid(...Object.values(jobLocations)),
  workingTime: Joi.string().valid(...Object.values(workingTimes)),
  seniorityLevel: Joi.string().valid(...Object.values(seniorityLevels)),
  jobDescription: Joi.string().trim().min(50),
  technicalSkills: Joi.array().items(Joi.string()).min(1),
  softSkills: Joi.array().items(Joi.string()).min(1),
  closed: Joi.boolean(),
}).min(1);

export const deleteJob = Joi.object({
  id: generalFields.id.required(),
});

export const applyJob = Joi.object({
  id: generalFields.id.required(),
});

export const getJobApplications = Joi.object({
  id: generalFields.id.required(),
});

export const handleApplication = Joi.object({
  id: generalFields.id.required(),
  status: Joi.string()
    .valid(...Object.values(applicationStatus))
    .required(),
});

export const filterJobs = Joi.object({
  jobLocation: Joi.string().valid(...Object.values(jobLocations)),
  workingTime: Joi.string().valid(...Object.values(workingTimes)),
  seniorityLevel: Joi.string().valid(...Object.values(seniorityLevels)),
  id: generalFields.id.required(),
}).min(1);

export const getCompanyJobs = Joi.object({
  jobId: generalFields.id,
});
