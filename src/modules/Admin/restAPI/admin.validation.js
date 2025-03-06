import Joi from "joi";
import { generalFields } from "../../../middleware/validation.middleware.js";

export const toggleCompanyBan = Joi.object({
  id: generalFields.id.required(),
});

export const toggleUserBan = Joi.object({
  id: generalFields.id.required(),
});

export const approveCompany = Joi.object({
  id: generalFields.id.required(),
});
