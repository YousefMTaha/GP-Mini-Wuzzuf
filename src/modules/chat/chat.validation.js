import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const getChatHistory = Joi.object({
  userId: generalFields.id.required(),
});
