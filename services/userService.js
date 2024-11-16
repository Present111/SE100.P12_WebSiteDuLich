const User = require("../models/User");

/**
 * Create a new user
 * @param {Object} userData - The data for the new user
 * @returns {Object} The created user
 */
const createUser = async (userData) => {
  const newUser = new User(userData);
  await newUser.save();
  return newUser;
};

/**
 * Get all users
 * @returns {Array} List of users
 */
const getAllUsers = async () => {
  return await User.find();
};

/**
 * Get a user by ID
 * @param {String} id - The ID of the user
 * @returns {Object} The user object
 */
const getUserById = async (id) => {
  return await User.findById(id);
};

/**
 * Update a user by ID
 * @param {String} id - The ID of the user
 * @param {Object} userData - The updated data
 * @returns {Object} The updated user
 */
const updateUserById = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

/**
 * Delete a user by ID
 * @param {String} id - The ID of the user
 * @returns {Object} The deleted user
 */
const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
