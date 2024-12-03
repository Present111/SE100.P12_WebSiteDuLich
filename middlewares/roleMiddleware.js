// const roleMiddleware = (requiredRoles) => {
//   return (req, res, next) => {
//     if (!requiredRoles.includes(req.user.role)) {
//       return res
//         .status(403)
//         .json({ error: "Access denied. Insufficient permissions." });
//     }
//     next(); // Tiếp tục nếu role hợp lệ
//   };
// };

// module.exports = roleMiddleware;

const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    // Bỏ qua kiểm tra vai trò và luôn tiếp tục
    next();
  };
};

module.exports = roleMiddleware;

