import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addCompany = Joi.object({
  companyName: Joi.string().min(2).trim().lowercase().required(),
  description: Joi.string().min(10).trim().required(),
  industry: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  numberOfEmployees: Joi.object({
    from: Joi.number().min(0).required(),
    to: Joi.number().min(0).required(),
  }).required(),
  companyEmail: Joi.string().email().lowercase().required(),
  createdBy: generalFields.id.required(),
  HRs: Joi.array().items(generalFields.id),
  approvedByAdmin: Joi.boolean(),
});

export const updateCompany = Joi.object({
  companyName: Joi.string().min(2).trim().lowercase(),
  description: Joi.string().min(10).trim(),
  industry: Joi.string().trim(),
  address: Joi.string().trim(),
  numberOfEmployees: Joi.object({
    from: Joi.number().min(0),
    to: Joi.number().min(0),
  }),
  companyEmail: Joi.string().email().lowercase(),
  HRs: Joi.array().items(generalFields.id),
}).min(1);

export const getCompany = Joi.object({
  id: generalFields.id.required(),
});

export const getCompanyByName = Joi.object({
  companyName: Joi.string().trim().lowercase().required(),
});

export const uploadPic = Joi.object({
  id: generalFields.id.required(),
});

export const deleteCompanyPic = Joi.object({
  id: generalFields.id.required(),
});

export const deleteCompany = Joi.object({
  id: generalFields.id.required(),
});
