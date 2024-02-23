const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");

const app = express();

//import database
const { sequelize } = require("./models");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: "http://localhost:3000",
    credentials: true
  }
));


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
