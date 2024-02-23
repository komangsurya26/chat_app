const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");
const io = require("socket.io")(2000,{
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const app = express();

//import database
const { sequelize } = require("./models");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let users = []
io.on("connection", (socket) => {
  socket.on("addUser", userId => {
    const isUserExist = users.find(user => user.userId === userId)
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  })

  socket.on("sendMessage", ({ senderId, receiveId, message, conversationId }) => {
    const receiver = users.find(user => user.userId === receiveId);
    const sender = users.find(user => user.userId === senderId);
    if (receiver) {
      io.to(receiver.socketId).to(sender.socketId).emit("getMessage", {
        senderId,
        message,
        conversationId,
        receiveId
      })
    }
  })

  socket.on("disconnect", () => {
    users = users.filter(user => user.socketId !== socket.id);
    io.emit("getUsers", users);
  })

  // io.emit("getUsers", socket.userId);
});

//!REST API 

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(userRouter);
app.use(chatRouter);


sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    app.listen(2001, () => {
      console.log("Server is running on port 2001");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });
