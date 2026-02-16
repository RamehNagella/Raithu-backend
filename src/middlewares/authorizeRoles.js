const authorizeRoles = (...roles) => {
  // console.log(roles);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
