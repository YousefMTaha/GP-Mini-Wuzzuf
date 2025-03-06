import userModel from "../../../DB/models/user.model.js";
import companyModel from "../../../DB/models/company.model.js";

export const toggleUserBan = async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.bannedAt) {
    user.bannedAt = undefined;
  } else {
    user.bannedAt = new Date();
  }
  await user.save();
  return res.status(200).json({
    success: true,
    message: `User ${user.bannedAt ? "banned" : "unbanned"} successfully`,
  });
};

export const toggleCompanyBan = async (req, res, next) => {
  const { id } = req.params;
  const company = await companyModel.findById(id);

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (company.bannedAt) {
    company.bannedAt = undefined;
  } else {
    company.bannedAt = new Date();
  }
  await company.save();

  return res.status(200).json({
    success: true,
    message: `Company ${company.bannedAt ? "banned" : "unbanned"} successfully`,
  });
};

export const approveCompany = async (req, res, next) => {
  const { id } = req.params;
  const company = await companyModel.findById(id);

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (company.approvedByAdmin) {
    return next(new Error("Company already approved before", { cause: 400 }));
  }

  company.approvedByAdmin = true;
  await company.save();

  return res.status(200).json({
    success: true,
    message: "Company approved successfully",
  });
};
