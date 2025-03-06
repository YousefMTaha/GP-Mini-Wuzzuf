import chatModel from "../../DB/models/chat.model.js";
import companyModel from "../../DB/models/company.model.js";
import userModel from "../../DB/models/user.model.js";

export function startChat(socket, io) {
  return async (data) => {
    try {
      const { userId, companyId, message } = data;

      const company = await companyModel.findById(companyId);

      if (
        !company ||
        !company.HRs.includes(socket.user._id ) || 
        !company.createdBy.toString() === socket.user._id
      ) {
        socket.emit("error", { message: "Not authorized to start chat" });
        return;
      }

      const user = await userModel.findById(userId);

      if (!user || user.role !== roles.USER) {
        socket.emit("error", {
          message: "Can only chat with regular users",
        });
        return;
      }

      const chat = await chatModel.create({
        senderId: socket.user._id,
        receiverId: userId,
        messages: [{ message, senderId: socket.user._id }],
      });

      await chat.populate([
        { path: "senderId", select: "firstName lastName userName" },
        { path: "receiverId", select: "firstName lastName userName" },
      ]);

      io.to([userId, socket.user._id]).emit("newMessage", chat);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  };
}

export const replyMessage = (socket, io) => {
  return async (data) => {
    try {
      const { receiverId, message } = data;
      const senderId = socket.user._id;

      const existingChat = await chatModel.findOne({
        $or: [
          { senderId, receiverId },
          { receiverId: senderId, senderId: receiverId },
        ],
      });

      if (!existingChat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      existingChat.messages.push({ message, senderId });
      await existingChat.save();

      await existingChat.populate([
        { path: "senderId", select: "firstName lastName userName" },
        { path: "receiverId", select: "firstName lastName userName" },
      ]);

      io.to([receiverId, senderId]).emit("newMessage", existingChat);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  };
};
