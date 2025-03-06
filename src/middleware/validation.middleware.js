import { Types } from "mongoose";
import joi from "joi";

export const generalFields = {
  attachment: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().required(),
  }),
  id: joi.custom(isValidId),
  email: joi.string().email(),
};

export const isValid = (schema) => {
  return async (req, res, next) => {
    let data = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files) data.attachment = req.file || req.files;

    // validate
    const result = schema.validate(data, { abortEarly: false });
    if (result.error) {
      let messages = result.error.details.map((obj) => obj.message);

      return next(new Error(messages, { cause: 400 }));
    }
    return next();
  };
};

function isValidId(value, helpers) {
  if (!Types.ObjectId.isValid(value))
    return helpers.message("invalid objectId");
  return true;
}
