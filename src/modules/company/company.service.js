import companyModel from "../../DB/models/company.model.js";
import userModel, { roles } from "../../DB/models/user.model.js";
import { cloudinaryFolders } from "../../utils/cloudFolders.js";
import cloudinary from "../../utils/file upload/cloud-config.js";

async function getUserIds(emails) {
  const userIds = [];
  const validEmails = [];
  for (const email of emails) {
    const user = await userModel.findOne({ email });
    if (user) {
      userIds.push(user._id);
      validEmails.push(email);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  }

  return { ids: userIds, emails: validEmails };
}

export const addCompany = async (req, res, next) => {
  const { companyEmail, companyName } = req.body;

  if (await companyModel.findOne({ companyEmail })) {
    return next(new Error("Company email already exists", { cause: 409 }));
  }

  if (await companyModel.findOne({ companyName })) {
    return next(new Error("Company name already exists", { cause: 409 }));
  }

  const HRsInfo = await getUserIds(req.body.HRs);

  req.body.HRs = HRsInfo.ids;
  req.body.createdBy = req.user._id;
  const company = await companyModel.create(req.body);
  company._doc.HRs = HRsInfo.emails;
  return res
    .status(200)
    .json({ success: true, msg: "Company created successfully", company });
};

export const updateCompany = async (req, res, next) => {
  const { companyEmail, companyName } = req.body;

  const company = await companyModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!company) {
    return next(
      new Error("Company not found or you are not the owner", { cause: 404 })
    );
  }

  if (company.bannedAt) {
    return next(new Error("Company is banned by admin", { cause: 400 }));
  }

  if (companyEmail && companyEmail !== company.companyEmail) {
    const emailExists = await companyModel.findOne({ companyEmail });
    if (emailExists) {
      return next(new Error("Company email already exists", { cause: 409 }));
    }
  }

  if (companyName && companyName !== company.companyName) {
    const nameExists = await companyModel.findOne({ companyName });
    if (nameExists) {
      return next(new Error("Company name already exists", { cause: 409 }));
    }
  }

  await company.updateOne(req.body);

  res
    .status(200)
    .json({ success: true, msg: "Company updated successfully", company });
};

export const deleteCompany = async (req, res, next) => {
  const company = await companyModel.findOne({
    _id: req.params.id,
    deletedAt: { $exists: false },
  });
  console.log(req.user._id);

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (
    req.user.role !== roles.ADMIN &&
    company.createdBy.toString() !== req.user._id.toString()
  ) {
    return next(
      new Error("Not authorized to delete this company", { cause: 403 })
    );
  }

  company.deletedAt = new Date();
  await company.save();

  res.status(200).json({ success: true, msg: "Company deleted successfully" });
};

export const getCompany = async (req, res, next) => {
  const company = await companyModel
    .findOne({ _id: req.params.id, deletedAt: { $exists: false } })
    .populate({
      path: "jobs",
      match: { deletedAt: { $exists: false } },
    });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  res.status(200).json({ success: true, msg: "done", company });
};

export const getCompanyByName = async (req, res, next) => {
  const { name } = req.query;

  const company = await companyModel.findOne({
    companyName: { $regex: name, $options: "i" },
    deletedAt: { $exists: false },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  res.status(200).json({ success: true, msg: "Success", company });
};

export const uploadCompanyLogo = async (req, res, next) => {
  const company = await companyModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
    deletedAt: { $exists: false },
  });

  if (!company) {
    return next(
      new Error("Company not found or you are not the owner", { cause: 404 })
    );
  }

  if (company.bannedAt) {
    return next(new Error("Company is banned by admin", { cause: 400 }));
  }

  if (company.logo?.public_id) {
    await cloudinary.uploader.destroy(company.logo.public_id);
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: cloudinaryFolders(company._id).companyLogo,
  });

  company.logo = {
    public_id: result.public_id,
    secure_url: result.secure_url,
  };

  await company.save();
  res.status(200).json({ success: true, msg: "Logo uploaded successfully" });
};

export const uploadCompanyCoverPic = async (req, res, next) => {
  const company = await companyModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
    deletedAt: { $exists: false },
  });

  if (!company) {
    return next(
      new Error("Company not found or you are not the owner", { cause: 404 })
    );
  }

  if (company.bannedAt) {
    return next(new Error("Company is banned by admin", { cause: 400 }));
  }

  if (company.coverPic?.public_id) {
    await cloudinary.uploader.destroy(company.coverPic.public_id);
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: cloudinaryFolders(company._id).companyCoverPic,
  });

  company.coverPic = {
    public_id: result.public_id,
    secure_url: result.secure_url,
  };

  await company.save();
  res
    .status(200)
    .json({ success: true, msg: "Cover picture uploaded successfully" });
};

export const deleteCompanyLogo = async (req, res, next) => {
  const company = await companyModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
    deletedAt: { $exists: false },
  });

  if (!company) {
    return next(
      new Error("Company not found or you are not the owner", { cause: 404 })
    );
  }

  if (company.bannedAt) {
    return next(new Error("Company is banned by admin", { cause: 400 }));
  }

  if (company.logo?.public_id) {
    await cloudinary.uploader.destroy(company.logo.public_id);
    company.logo = undefined;
    await company.save();
  }

  res.status(200).json({ success: true, msg: "Logo deleted successfully" });
};

export const deleteCompanyCoverPic = async (req, res, next) => {
  const company = await companyModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
    deletedAt: { $exists: false },
  });

  if (!company) {
    return next(
      new Error("Company not found or you are not the owner", { cause: 404 })
    );
  }

  if (company.bannedAt) {
    return next(new Error("Company is banned by admin", { cause: 400 }));
  }

  if (company.coverPic?.public_id) {
    await cloudinary.uploader.destroy(company.coverPic.public_id);
    company.coverPic = undefined;
    await company.save();
  }

  res
    .status(200)
    .json({ success: true, msg: "Cover picture deleted successfully" });
};

export const getUserCompanies = async (req, res, next) => {
  const userId = req.user._id;

  const companies = await companyModel.aggregate([
    { $match: { $or: [{ createdBy: userId }, { HRs: { $in: [userId] } }] } },
    {
      $addFields: {
        userRole: {
          $cond: {
            if: { $eq: ["$createdBy", userId] },
            then: "owner",
            else: "hr",
          },
        },
      },
    },
  ]);

  return  res.status(200).json({ success: true, data: companies })

};
