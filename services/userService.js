const Hotel = require("../models/Hotel");
const Provider = require("../models/Provider");
const Room = require("../models/Room");
const Service = require("../models/Service");
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


const getUserByUserID = async (userID) => {
  try {
    // Lấy User theo userID
    let user = await User.findOne({ userID });

    // if (!user) {
    //   throw new Error("User không tồn tại với userID này");
    // }

    // Lấy Provider có user._id tương ứng
    const provider = await Provider.findOne({ userID: user._id }).exec();

    // if (!provider) {
    //   throw new Error("Provider không tồn tại với user._id này");
    // }

    // Lấy các Service của Provider và populate locationID
    const services = await Service.find({ providerID: provider._id })
      .populate("providerID") // Lấy thông tin chi tiết của Provider nếu cần
      .populate("locationID") // Lấy thông tin chi tiết của Location
      .exec();

    // Lấy thông tin khách sạn (hotel), phòng (room) và location cho mỗi dịch vụ
    const updatedServices = await Promise.all(services.map(async (service) => {
      // Lấy tất cả các khách sạn liên quan đến service
      const hotels = await Hotel.find({ serviceID: service._id }).exec();

      // Lấy phòng cho mỗi khách sạn
      const updatedHotels = await Promise.all(hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelID: hotel._id }).exec();
        const updatedHotel = { ...hotel._doc, rooms };
        return updatedHotel;
      }));

      // Gắn thông tin khách sạn, phòng và location vào dịch vụ
      const updatedService = { 
        ...service._doc, 
        hotels: updatedHotels, 
      
      };
      return updatedService;
    }));

    // Trả về User và danh sách Services cùng với thông tin Hotel, Room và Location
    const newUser = { ...user._doc, services: updatedServices };
    console.log("PROVIDER", newUser);
    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(`Lỗi khi lấy User và Dịch vụ: ${error.message}`);
  }
};




// // Ví dụ sử dụng
// (async () => {
//   const userID = "ID_CỦA_USER"; // Thay bằng userID thực tế
//   try {
//     const result = await getUserByUserID(userID);
//     console.log("Thông tin User và các dịch vụ:", result);
//   } catch (error) {
//     console.error(error.message);
//   }
// })();



module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByUserID
};
