const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  const expToken = new Date();

  expToken.setHours(expToken.getHours() + 3);

  const payload = {
    token_type: "access",
    id: user._id,
    email: user.email,
    iat: Date.now(),
    exp: expToken.getTime(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

function createRefreshToken(user) {
  const expToken = new Date();

  expToken.getMonth(expToken.getMonth() + 1);

  const payload = {
    token_type: "refresh",
    user_id: user._id,
    iat: Date.now(),
    exp: expToken.getTime(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

function decodedToken(token) {
  return jwt.decode(token, JWT_SECRET_KEY, true);
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  createRefreshToken,
  decodedToken,
  verifyToken,
};
