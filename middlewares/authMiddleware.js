// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "Authentication token is required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Gán thông tin user vào request

//     console.log("req.user:", req.user); // Log thông tin user để kiểm tra

//     next();
//   } catch (err) {
//     res.status(403).json({ error: "Invalid token" });
//   }
// };

// module.exports = authMiddleware;


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  // Bỏ qua kiểm tra token và luôn chấp nhận token
  if (token) {
    // Chỉ gán thông tin người dùng vào req.user mà không xác thực
    req.user = { id: "exampleUserId", username: "exampleUser" };
    console.log("req.user:", req.user); // Log thông tin user
  }

  next();
};

module.exports = authMiddleware;
