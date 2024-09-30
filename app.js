const express = require("express");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const authRouter = require("./routes/authRouter");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const ACCESS_TOKEN_SECRET = "youraccesstokensecret";
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Passport strategy для Access Token
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    const user = users.find((user) => user.id === jwt_payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

app.use(passport.initialize());
app.use("/auth", authRouter);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
