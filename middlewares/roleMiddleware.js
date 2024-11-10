const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
    next(); // Tiếp tục nếu role hợp lệ
  };
};

module.exports = roleMiddleware;
