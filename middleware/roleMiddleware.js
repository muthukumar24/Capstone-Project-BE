
const roleMiddleware = (roles) => (req, res, next) => {
  // console.log('User Role:', req.user ? req.user.role : 'No user');
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = roleMiddleware;
