const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for a user
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
 * Middleware to verify JWT token from cookie
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

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
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
 * Optional auth middleware - doesn't fail if no token provided
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
    // Silently ignore invalid tokens for optional auth
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

