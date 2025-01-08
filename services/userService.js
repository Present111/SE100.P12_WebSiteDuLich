const Coffee = require("../models/Coffee");
const Hotel = require("../models/Hotel");
const Provider = require("../models/Provider");
const Restaurant = require("../models/Restaurant");
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
  console.log("HELLO")
  // Cập nhật thông tin user
  const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });
  console.log(updatedUser )
  if (updatedUser.role === "Provider") {
    // Kiểm tra nếu chưa có Provider nào chứa userID
    const existingProvider = await Provider.findOne({ userID: updatedUser._id });

    if (!existingProvider) {
      // Tạo Provider mới với thông tin mặc định
      await Provider.create({
        providerID: `PROV-${Date.now()}`, // Mã định danh Provider (có thể thay đổi cách tạo mã)
        userID: updatedUser._id,
        providerName: updatedUser.fullName || "Default Provider Name",
        address: "Default Address",
        serviceDescription: "Default Service Description",
        bankName: "Default Bank",
        accountNumber: "0000000000",
        accountName: updatedUser.fullName || "Default Account Name",
      });
    }
  }

  return updatedUser;
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
    let user = await User.findOne({ userID })?.populate({
      path: "loveList",
      populate: {
        path: "locationID", // Tham chiếu từ Service tới Location
        model: "Location", // Model của Location
      },
    }) ;

    // if (!user) {
    //   throw new Error("User không tồn tại với userID này");
    // }

    // Lấy Provider có user._id tương ứng
    const provider = await Provider.findOne({ userID: user._id }).exec();

    // if (!provider) {
    //   throw new Error("Provider không tồn tại với user._id này");
    // }
    

    if(provider){
    // Lấy các Service của Provider và populate locationID
    const services = await Service.find({ providerID: provider._id })
      .populate("providerID") // Lấy thông tin chi tiết của Provider nếu cần
      .populate("locationID") // Lấy thông tin chi tiết của Location
      .populate({
        path: "reviews",
        
        
      })
      .exec();

    // Lấy thông tin khách sạn (hotel), phòng (room) và location cho mỗi dịch vụ
    const updatedServices = await Promise.all(services.map(async (service) => {
      // Lấy tất cả các khách sạn liên quan đến service
      const hotels = await Hotel.find({ serviceID: service._id }).exec();
      const res = await Restaurant.find({ serviceID: service._id }).exec();
      const coffee = await Coffee.find({ serviceID: service._id }).exec();


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
        restaurants: res,
        coffees: coffee
      
      };
      return updatedService;
    }));

    // Trả về User và danh sách Services cùng với thông tin Hotel, Room và Location
    const newUser = { ...user._doc, services: updatedServices };
    
    return newUser;
  }
  else return user;
  } catch (error) {
    console.log(error);
    throw new Error(`Lỗi khi lấy User và Dịch vụ: ${error.message}`);
  }
};


const getUserByUserID2 = async (userID) => {
  try {
    // Lấy User theo userID
    let user = await User.findOne({ userID }).exec()

    // if (!user) {
    //   throw new Error("User không tồn tại với userID này");
    // }

    // Lấy Provider có user._id tương ứng
    const provider = await Provider.findOne({ userID: user._id }).exec();

    // if (!provider) {
    //   throw new Error("Provider không tồn tại với user._id này");
    // }
    

    if(provider){
    // Lấy các Service của Provider và populate locationID
    const services = await Service.find({ providerID: provider._id })
      .populate("providerID") // Lấy thông tin chi tiết của Provider nếu cần
      .populate("locationID") // Lấy thông tin chi tiết của Location
      .populate({
        path: "reviews",
        
        
      })
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
    
    return newUser;
  }
  else return user;
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
  getUserByUserID,getUserByUserID2
};
