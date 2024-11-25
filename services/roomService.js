const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// Tạo Room mới
const createRoom = async (roomData, user, picturePath) => {
  const { roomID, hotelID, roomType, availableRooms, availableDate, active } =
    roomData;

  const hotel = await Hotel.findById(hotelID);
  if (!hotel) throw new Error("Hotel ID không tồn tại.");

  if (user.role === "Provider" && user.id !== hotel.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Room cho Hotel này.");
  }

  const newRoom = new Room({
    roomID,
    hotelID,
    roomType,
    availableRooms,
    availableDate,
    active: active ?? true,
    picture: picturePath,
  });

  return await newRoom.save();
};

// Lấy tất cả Rooms
const getAllRooms = async () => {
  return await Room.find().populate("hotelID", "hotelName");
};

// Lấy Room theo ID
const getRoomById = async (id) => {
  return await Room.findById(id).populate("hotelID", "hotelName");
};

// Cập nhật Room
const updateRoomById = async (id, roomData) => {
  const room = await Room.findById(id);
  if (!room) throw new Error("Room not found");

  Object.assign(room, roomData);
  return await room.save();
};

// Xóa Room
const deleteRoomById = async (id) => {
  const room = await Room.findById(id);
  if (!room) throw new Error("Room not found");

  return await room.remove();
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
};
