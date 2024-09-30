const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");
const refreshTokens = new Set();

// Секретні ключі для токенів
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret";

// Функція для зчитування користувачів з файлу
function readUsersFromFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Функція для збереження користувачів
function saveUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = readUsersFromFile(); // Читаємо користувачів з файлу
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  };
  users.push(user);
  saveUsersToFile(users);
  res.status(201).send("User registered");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = readUsersFromFile();
  const user = users.find((user) => user.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Email or password incorrect");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET);

  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
};

exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.has(token)) return res.sendStatus(403);

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    refreshTokens.delete(token);
    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET);
    refreshTokens.add(newRefreshToken);

    const accessToken = generateAccessToken({ id: user.id });
    res.json({ accessToken, refreshToken: newRefreshToken });
  });
};

exports.protectedRoute = (req, res) => {
  res.send("This is a protected route");
};

exports.logout = (req, res) => {
  const { token } = req.body;
  refreshTokens.delete(token); // Видаляємо токен з `Set`
  res.sendStatus(204);
};
