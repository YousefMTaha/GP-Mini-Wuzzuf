import { Schema, model, Types } from "mongoose";
import jobModel from "./job.model.js";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 2,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfEmployees: {
      from: { type: Number, min: 0, required: true },
      to: { type: Number, min: 0, required: true },
    },
    companyEmail: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    HRs: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    logo: {
      secure_url: {
        type: String,
        default:
          "https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg",
      },
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    legalAttachment: {
      secure_url: String,
      public_id: String,
    },
    bannedAt: Date,
    deletedAt: Date,
    approvedByAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.index({ createBy: 1, companyName: 1 });

companySchema.virtual("jobs", {
  localField: "_id",
  foreignField: "companyId",
  ref: "Job",
});

// companySchema.post("findOne", function (doc) {
//   if (doc && doc.numberOfEmployees.from != undefined) {
//     doc._doc.numberOfEmployees = `[${doc.numberOfEmployees.from} - ${doc.numberOfEmployees.to}]`;
//   }
//   return doc;
// });

// companySchema.post("find", function (docs) {
//   return docs.map((doc) => {
//     if (doc && doc.numberOfEmployees.from != undefined) {
//       doc._doc.numberOfEmployees = `[${doc.numberOfEmployees.from} - ${doc.numberOfEmployees.to}]`;
//     }
//   });
// });

companySchema.post("save", async function () {
  if (this.deletedAt) {
    await jobModel.deleteMany({ companyId: this._id });
  }
});

const companyModel = model("Company", companySchema);
export default companyModel;
