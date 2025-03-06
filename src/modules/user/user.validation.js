import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const updateUser = joi
  .object({
    firstName: joi.string().min(2).max(15).alphanum(),
    lastName: joi.string().min(2).max(15).alphanum(),
    recoveryEmail: joi.string().email(),
    DOB: joi.string(),
    mobileNumber: joi.string().regex(/^01[0125][0-9]{8}$/),
  })
  .required();

export const updatePassword = joi
  .object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
  })
  .required();

export const getProfile = joi
  .object({
    id: generalFields.id.required(),
  })
  .required();
