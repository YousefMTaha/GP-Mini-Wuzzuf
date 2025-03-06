import joi from "joi";
import { genders, roles } from "../../DB/models/user.model.js";

export const register = joi
  .object({
    email: joi.string().email().required(),
    recoveryEmail: joi.string().email(),
    password: joi.string().required(),
    cPassword: joi.string().valid(joi.ref("password")).required(),
    firstName: joi.string().min(3).max(15).alphanum().required(),
    lastName: joi.string().min(3).max(15).alphanum().required(),
    mobileNumber: joi
      .string()
      .pattern(/^01[0125][0-9]{8}$/)
      .required(),
    gender: joi.string().valid(...Object.values(genders)),
    DOB: joi.string().required(),
    role: joi.string().valid(...Object.values(roles)),
  })
  .required();

export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const googleLoginOrSignup = joi
  .object({
    idToken: joi.string().required(),
  })
  .required();

export const sendOTP = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const sendOtpForgetPassword = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const getAllEmailAssociateWithRecoveryEmail = joi
  .object({
    recoveryEmail: joi.string().email().required(),
  })
  .required();

export const confirmForgetPassword = joi
  .object({
    email: joi.string().email().required(),
    otp: joi.string().length(5).required(),
    password: joi.string().required(),
  })
  .required();

export const refreshToken = joi
  .object({
    refreshToken: joi.string().required(),
  })
  .required();
