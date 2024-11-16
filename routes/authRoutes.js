const express = require("express");
const { body, validationResult } = require("express-validator");
const authService = require("../services/authService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực người dùng
 */

// Register Endpoint
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 example: U001
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "123456789"
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [Admin, Provider, Customer]
 *                 example: Customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("birthDate").notEmpty().withMessage("Birth date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = await authService.registerUser(req.body);
      res
        .status(201)
        .json({ message: "User registered successfully", data: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login Endpoint
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const token = await authService.loginUser(
        req.body.email,
        req.body.password
      );
      res.status(200).json({ token, message: "Login successful" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
