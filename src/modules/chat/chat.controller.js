import { Router } from "express";
import { asyncHandler } from "../../utils/error/async-handler.js";
import * as chatService from "./chat.service.js";
const chatRouter = Router();

chatRouter.get("/:userId", asyncHandler(chatService.getChatHistory));

export default chatRouter;