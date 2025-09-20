// middleware/adminCheck.js
function adminCheck(req, res, next) {
  // Assuming req.user is set after JWT verification
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
}

module.exports = adminCheck;
