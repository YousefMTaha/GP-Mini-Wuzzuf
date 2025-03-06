import { Schema, model, Types } from "mongoose";
import { hash } from "../../utils/hash/hash.js";
import { decrypt } from "../../utils/crypto/decryption.js";
import { encrypt } from "../../utils/crypto/encryption.js";

export const roles = {
  USER: "User",
  ADMIN: "Admin",
};

export const genders = {
  MALE: "Male",
  FEMALE: "Female",
};

export const providers = {
  SYSTEM: "system",
  GOOGLE: "google",
};

export const otpTypes = {
  CONFIRM_EMAIL: "confirmEmail",
  FORGET_PASSWORD: "forgetPassword",
};

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providers.SYSTEM;
      },
    },
    provider: {
      type: String,
      enum: Object.values(providers),
      default: providers.SYSTEM,
    },
    gender: {
      type: String,
      enum: Object.values(genders),
      default: genders.MALE,
    },
    DOB: {
      type: Date,
      validate: {
        validator: function (value) {
          if (value > new Date()) {
            return false;
          }

          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();

          return age >= 18;
        },
        message: "Date must be in the past and age must be 18 or older",
      },
    },
    mobileNumber: {
      type: String,
      required: function () {
        return this.provider === providers.SYSTEM;
      },
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    changeCredentialTime: Date,
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("username").get(function () {
  return this.firstName + " " + this.lastName;
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hash({ data: this.password });
  }
  if (this.isModified("mobileNumber")) {
    this.mobileNumber = encrypt({ data: this.mobileNumber });
  }
  next();
});

userSchema.post("findOne", function (doc) {
  if (doc?.mobileNumber) {
    doc._doc.mobileNumber = decrypt({ data: doc.mobileNumber });
  }
  return doc;
});

const userModel = model("User", userSchema);
export default userModel;
