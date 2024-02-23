const router = require("express").Router();
const { CreateConversation, GetConversation, CreateMessage, GetMessages } = require("../controller/chat");

router
  .post("/api/conversation", CreateConversation)
  .get("/api/conversation", GetConversation)
  .post("/api/message", CreateMessage)
  .get("/api/message", GetMessages);

module.exports = router;
