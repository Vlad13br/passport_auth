const fs = require("fs");
const path = require("path");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const users = JSON.parse(
          await fs.promises.readFile(USERS_FILE, "utf8")
        );
        const user = users.find((user) => user.id === jwt_payload.id);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
