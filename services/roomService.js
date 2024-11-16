const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

/**
 * Tạo một Room mới
 * @param {Object} roomData - Dữ liệu của Room
 * @param {Object} user - Người dùng hiện tại
 * @returns {Object} - Room vừa tạo
 */
const createRoom = async (roomData, user) => {
  const { roomID, hotelID, roomType, availableRooms, availableDate } = roomData;

  // Kiểm tra Hotel ID
  const hotel = await Hotel.findById(hotelID);
  if (!hotel) {
    throw new Error("Hotel ID không tồn tại.");
  }

  // Kiểm tra quyền của Provider
  if (user.role === "Provider" && user.id !== hotel.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Room cho Hotel này.");
  }

  const newRoom = new Room({
    roomID,
    hotelID,
    roomType,
    availableRooms,
    availableDate,
  });

  return await newRoom.save();
};

/**
 * Lấy tất cả các Rooms
 * @returns {Array} - Danh sách Rooms
 */
const getAllRooms = async () => {
  return await Room.find().populate("hotelID", "hotelName serviceID");
};

/**
 * Lấy chi tiết Room theo ID
 * @param {String} id - ID của Room
 * @returns {Object|null} - Room hoặc null nếu không tìm thấy
 */
const getRoomById = async (id) => {
  return await Room.findById(id).populate("hotelID", "hotelName serviceID");
};

/**
 * Xóa một Room theo ID
 * @param {String} id - ID của Room
 * @param {Object} user - Người dùng hiện tại
 * @returns {Boolean} - Kết quả xóa
 */
const deleteRoomById = async (id, user) => {
  const room = await Room.findById(id).populate("hotelID");

  if (!room) {
    throw new Error("Room not found");
  }

  // Kiểm tra quyền xóa
  if (user.role !== "Admin" && user.id !== room.hotelID.serviceID.providerID) {
    throw new Error("Access denied");
  }

  await room.remove();
  return true;
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  deleteRoomById,
};
