const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT sent in the Authorization header and attaches the
// live user document to req.user. Rejects suspended accounts immediately.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'You need to log in first.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'That account no longer exists.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}

// Call as requireRole('admin') after requireAuth to gate admin-only routes.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do that." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
