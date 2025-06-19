import interviewModel from "../../DB/models/interview.model.js";
import jobModel from "../../DB/models/job.model.js";
import { decrypt } from "../../utils/crypto/decryption.js";

export const addInterviewSummary = async (req, res, next) => {
  req.body.userId = req.user._id;
  req.body.jobId = req.params.jobId;

  if (!(await jobModel.findById(req.body.jobId))) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Interview summary added successfully",
    data: await interviewModel.create(req.body),
  });
};

export const getInterviewSummary = async (req, res, next) => {
  const data = await interviewModel
    .findOne({
      jobId: req.params.jobId,
    })
    .populate("userId", "firstName lastName userName email mobileNumber ")
    .sort("score");

  if (data.userId) {
    data.userId.mobileNumber = decrypt({ data: data.userId.mobileNumber });
  }

  return res.status(200).json({
    success: true,
    message: "Interview summary retrieved successfully",
    data,
  });
};
