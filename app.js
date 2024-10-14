require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");
// const helmet = require("helmet");
const morgan = require("morgan");
const authRouter = require("./routes/authRouter");
const passportConfig = require("./config/passport");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", // клієнтський домен
  credentials: true,               // Дозволити включення облікових даних
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(morgan("combined"));

passportConfig(passport);
app.use(passport.initialize());

app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
