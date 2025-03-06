import chatModel from "../../DB/models/chat.model.js";

export const getChatHistory = async (req, res, next) => {
  const { userId } = req.params;
  const currentUser = req.user;

  const messages = await chatModel
    .find({
      $or: [
        { sender: currentUser._id, receiver: userId },
        { sender: userId, receiver: currentUser._id },
      ],
    })
    .sort("createdAt")
    .populate([{ path: "senderId" }, { path: "receiverId" }]);

  return res.status(200).json({
    success: true,
    messages,
  });
};
