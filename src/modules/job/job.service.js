import companyModel from "../../DB/models/company.model.js";
import jobModel from "../../DB/models/job.model.js";
import applicationModel, {
  applicationStatus,
} from "../../DB/models/application.model.js";
import cloudinary from "../../utils/file upload/cloud-config.js";
import { emailEvent } from "../../utils/email/email-event.js";
import { cloudinaryFolders } from "../../utils/cloudFolders.js";

export const addJob = async (req, res, next) => {
  const company = await companyModel.findById(req.params.id);

  if (!company) {
    return next(new Error("No company found", { cause: 404 }));
  }

  if (
    company.createdBy.toString() != req.user._id &&
    !company.HRs.includes(req.user._id)
  ) {
    return next(
      new Error("Not authorized to add jobs for this company", { cause: 403 })
    );
  }

  if (company.deletedAt) {
    return next(new Error("Company is deleted by owner", { cause: 400 }));
  }

  if (company.bannedAt) {
    return next(new Error("Company banned by admin", { cause: 400 }));
  }

  const job = await jobModel.create({
    ...req.body,
    createdBy: req.user._id,
    companyId: company._id,
  });

  res.status(200).json({ success: true, job, company });
};

export const updateJob = async (req, res, next) => {
  const job = await jobModel.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!job) {
    return next(
      new Error("Job not found or you are not the owner", { cause: 404 })
    );
  }

  req.body.updatedBy = req.user._id;

  await job.updateOne(req.body);

  res.status(200).json({ success: true, job });
};

export const deleteJob = async (req, res, next) => {
  const job = await jobModel.findById(req.params.id).populate("companyId");

  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  if (
    company.createdBy.toString() != req.user._id &&
    !company.HRs.includes(req.user._id)
  ) {
    return next(
      new Error("Only company HR or owner can delete jobs", { cause: 403 })
    );
  }

  await job.deleteOne();
  res.status(200).json({ success: true, message: "Job deleted successfully" });
};

export const getCompanyJobs = async (req, res, next) => {
  const { companyId, jobId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
  const skip = (page - 1) * limit;
  let query = { companyId };
  if (jobId) {
    const job = await jobModel
      .findOne({
        _id: jobId,
        companyId: query.companyId,
      })
      .populate("companyId");
    return job
      ? res.status(200).json({ success: true, message: "job found", job })
      : next(new Error("Job not found", { cause: 404 }));
  }

  const jobs = await jobModel
    .find(query)
    .populate("companyId", "companyName logo")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await jobModel.countDocuments(query);

  return res.status(200).json({
    success: true,
    jobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total,
    },
  });
};

async function getCompaniesId(name) {
  const companies = await companyModel.find({
    companyName: { $regex: name, $options: "i" },
  });

  const ids = companies.map((company) => company._id);

  return ids;
}

export const filterJobs = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    jobTitle,
    companyName,
    ...restQueryFields
  } = req.query;
  const skip = (page - 1) * limit;

  if (jobTitle) {
    restQueryFields.jobTitle = { $regex: jobTitle, $options: "i" };
  }

  if (companyName) {
    restQueryFields.companyId = { $in: await getCompaniesId(companyName) };
  }

  const jobs = await jobModel
    .find(restQueryFields)
    .populate("companyId")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await jobModel.countDocuments(restQueryFields);

  return res.status(200).json({
    success: true,
    jobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total,
    },
  });
};

export const getJobApplications = async (req, res, next) => {
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
  const skip = (page - 1) * limit;

  let job = await jobModel.findById(req.params.id).populate("companyId");

  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  if (
    job.createdBy.toString() != req.user._id &&
    !job.companyId.HRs.includes(req.user._id)
  ) {
    return next(
      new Error("Not authorized to view applications", { cause: 403 })
    );
  }

  job = await job.populate([
    {
      path: "applications",
      options: { sort, skip, limit },
      populate: {
        path: "userId",
        select: "firstName lastName userName email",
      },
    },
  ]);

  const total = await applicationModel.countDocuments({ jobId: job._id });

  return res.status(200).json({
    success: true,
    applications: job.applications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
    },
  });
};

export const applyJob = async (req, res, next) => {
  const job = await jobModel.findById(req.params.id).populate("companyId");

  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  if (job.closed) {
    return next(new Error("Job closed", { cause: 400 }));
  }

  if (
    await applicationModel.findOne({
      jobId: req.params.id,
      userId: req.user._id,
    })
  ) {
    return next(
      new Error("You have already applied for this job", { cause: 400 })
    );
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: cloudinaryFolders(req.user._id).jobApplications }
  );

  const application = await applicationModel.create({
    userId: req.user._id,
    jobId: job._id,
    userCV: { secure_url, public_id },
  });

  console.log("Notification to hr event");

  res.status(200).json({ success: true, application });
};

export const handleApplication = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const application = await applicationModel
    .findById(id)
    .populate("userId")
    .populate({
      path: "jobId",
      populate: { path: "companyId" },
    });

  if (!application) {
    return next(new Error("Application not found", { cause: 404 }));
  }

  if (!application.jobId.companyId.HRs.includes(req.user._id)) {
    return next(new Error("Only HR can handle applications", { cause: 403 }));
  }

  application.status = status;
  await application.save();

  emailEvent.emit(
    "sendApplicationStatusEmail",
    application.userId.email,
    status,
    application.userId.username,
    application.jobId.jobTitle,
    application.jobId.companyId.companyName
  );

  res.status(200).json({ success: true, message: "done" });
};

export const changeApplicationStatus = async (req, res, next) => {
  const { jobId } = req.params;

  const application = await applicationModel.findOneAndUpdate(
    { jobId, userId: req.user._id },
    { status: applicationStatus.INTERVIEWED }
  );

  if (!application) {
    return next(
      new Error("Application not found or you are not the applicant", {
        cause: 404,
      })
    );
  }

  res.status(200).json({ success: true, message: "done" });
};

export const getApplicationStatus = async (req, res, next) => {
  const { jobId } = req.params;

  const application = await applicationModel.findOne({
    jobId,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: application ? application.status : "not applied",
  });
};
