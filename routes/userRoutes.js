const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const userService = require("../services/userService");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("birthDate").notEmpty().withMessage("Birth date is required"),
    body("role")
      .isIn(["Admin", "Provider", "Customer"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = await userService.createUser(req.body);
      res
        .status(201)
        .json({ message: "User created successfully", data: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (role && !["Admin", "Provider", "Customer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      const updatedUser = await userService.updateUserById(
        req.params.id,
        req.body
      );
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res
        .status(200)
        .json({ message: "User updated successfully", data: updatedUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedUser = await userService.deleteUserById(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
