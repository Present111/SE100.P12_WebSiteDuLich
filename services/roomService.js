const Room = require("../models/Room");
const Hotel = require("../models/Hotel");

// Tạo Room mới
const createRoom = async (roomData, user, picturePath) => {
  const {
    roomID,
    hotelID,
    roomType,
    availableRooms,
    availableDate,
    active,
    capacity,
  } = roomData;

  // Kiểm tra Hotel có tồn tại hay không
  const hotel = await Hotel.findById(hotelID);
  if (!hotel) throw new Error("Hotel ID không tồn tại.");

  // Kiểm tra quyền Provider (nếu người dùng không phải Admin)
  if (user.role === "Provider" && user.id !== hotel.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Room cho Hotel này.");
  }

  // Kiểm tra thuộc tính capacity
  if (!capacity || typeof capacity !== "object") {
    throw new Error(
      "Capacity phải là một object với các giá trị adults và children."
    );
  }
  const { adults, children } = capacity;
  if (!Number.isInteger(adults) || adults < 1) {
    throw new Error("Capacity (adults) phải là số nguyên >= 1.");
  }
  if (!Number.isInteger(children) || children < 0) {
    throw new Error("Capacity (children) phải là số nguyên >= 0.");
  }

  // Tạo Room mới
  const newRoom = new Room({
    roomID,
    hotelID,
    roomType,
    availableRooms,
    availableDate,
    active: active ?? true, // Nếu không cung cấp, mặc định là true
    picture: picturePath,
    capacity: {
      adults,
      children,
    },
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
