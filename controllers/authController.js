const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");
const REFRESH_TOKENS_FILE = path.join(
  __dirname,
  "..",
  "data",
  "refreshTokens.json"
);

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret";

function readUsersFromFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function saveUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readRefreshTokensFromFile() {
  if (!fs.existsSync(REFRESH_TOKENS_FILE)) {
    fs.writeFileSync(REFRESH_TOKENS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(REFRESH_TOKENS_FILE);
  return JSON.parse(data);
}

function saveRefreshTokensToFile(tokens) {
  fs.writeFileSync(REFRESH_TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // if (!username || !email || !password) {
  //   console.log(req.body);
  //   return res.status(400).send("All fields are required");
  // }

  const users = readUsersFromFile();

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    console.log(req.body);
    return res.status(400).send("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
  };

  users.push(user);

  saveUsersToFile(users);

  res.status(201).send("User registered");
};

exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;
  const users = readUsersFromFile();
  const user = users.find((user) => user.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Email or password incorrect");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET);

  const refreshTokens = readRefreshTokensFromFile();
  refreshTokens.push(refreshToken);
  saveRefreshTokensToFile(refreshTokens);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Токен не буде доступний з JavaScript
    secure: false,   // Тільки для HTTPS (рекомендовано для продакшн)
    sameSite: 'None', // Відправляти лише з запитами на той самий сайт
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
  });
  console.log('Refresh token set in cookies:', refreshToken);

  res.json({ accessToken });
};

exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).send("No refresh token found");
  }

  const refreshTokens = readRefreshTokensFromFile();
  if (!refreshTokens.includes(token)) {
    return res.status(403).send("Refresh token not found");
  }

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid refresh token");
    }

    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken({ id: user.id });

    // Оновлюємо рефреш токен у cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
    });

    res.json({ accessToken });
  });
};

exports.protectedRoute = (req, res) => {
  res.send("This is a protected route");
};

exports.logout = (req, res) => {
  const { token } = req.body;
  const refreshTokens = readRefreshTokensFromFile();
  const newRefreshTokens = refreshTokens.filter((t) => t !== token);
  saveRefreshTokensToFile(newRefreshTokens);
  res.sendStatus(204);
};
