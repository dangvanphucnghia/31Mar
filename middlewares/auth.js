const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
}

function isMod(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'mod')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Mod access required' });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  isMod
};
