const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object containing id, username, email, and permission.
 * @returns {string} The signed JWT token.
 * @function generateToken
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    permission: user.permission,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Express middleware to verify JWT token from cookie.
 * If valid, attaches user info to req.user and req.userId.
 * Responds with 401 if token is missing, expired, or invalid.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @function authMiddleware
 */
function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Nincs hitelesítési token. Kérjük jelentkezzen be.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'A hitelesítési token lejárt. Kérjük jelentkezzen be újra.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Érvénytelen hitelesítési token.',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Szerverhiba a hitelesítés során.',
    });
  }
}

/**
 * Optional authentication middleware.
 * If a token is present and valid, attaches user info to req.user and req.userId.
 * If no token or invalid, continues without error.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @function optionalAuthMiddleware
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id;
    }

    next();
  } catch (error) {
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  generateToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};

