const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const Facility = require("../models/Facility");

// Tạo Room mới
const createRoom = async (roomData, user, picturePaths) => {
  const {
    roomID,
    hotelID,
    roomType,
    price,
    discountPrice,
    active,
    capacity,
    facilities,
    roomsAvailable, // Mảng chứa thông tin ngày và số phòng trống
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
  const { adults, children, roomNumber } = capacity;
  if (!Number.isInteger(adults) || adults < 1) {
    throw new Error("Capacity (adults) phải là số nguyên >= 1.");
  }
  if (!Number.isInteger(children) || children < 0) {
    throw new Error("Capacity (children) phải là số nguyên >= 0.");
  }
  if (!Number.isInteger(roomNumber) || roomNumber < 0) {
    throw new Error("roomNumber phải là số nguyên >= 0.");
  }

  // Kiểm tra giá
  if (price === undefined || price < 0) {
    throw new Error("Price phải là số không âm và bắt buộc.");
  }
  if (
    discountPrice !== undefined &&
    (discountPrice < 0 || discountPrice >= price)
  ) {
    throw new Error("Discount Price phải là số không âm và nhỏ hơn Price.");
  }

  // Kiểm tra danh sách tiện ích
  if (facilities) {
    for (const facilityID of facilities) {
      const facility = await Facility.findById(facilityID);
      if (!facility) {
        throw new Error(`Facility ID không tồn tại: ${facilityID}`);
      }
    }
  }

  // Kiểm tra mảng roomsAvailable
  if (
    !roomsAvailable ||
    !Array.isArray(roomsAvailable) ||
    roomsAvailable.length === 0
  ) {
    throw new Error("Ít nhất một ngày với số phòng trống phải được cung cấp.");
  }

  // Kiểm tra từng phần tử trong mảng roomsAvailable
  for (const room of roomsAvailable) {
    const { date, availableRooms } = room;

    // Kiểm tra format date
    if (!Date.parse(date)) {
      throw new Error(`Ngày không hợp lệ: ${date}`);
    }

    // Kiểm tra availableRooms là một số nguyên và >= 0
    if (!Number.isInteger(availableRooms) || availableRooms < 0) {
      throw new Error(`Số phòng trống không hợp lệ: ${availableRooms}`);
    }
  }

  // Kiểm tra danh sách ảnh tải lên
  if (
    !picturePaths ||
    !Array.isArray(picturePaths) ||
    picturePaths.length === 0
  ) {
    throw new Error("Ít nhất một ảnh phải được cung cấp.");
  }

  // Tạo Room mới
  const newRoom = new Room({
    roomID,
    hotelID,
    roomType,
    price,
    discountPrice,
    active: active ?? true, // Nếu không cung cấp, mặc định là true
    pictures: picturePaths, // Lưu danh sách đường dẫn ảnh
    capacity: {
      adults,
      children,
      roomNumber,
    },
    facilities, // Lưu danh sách tiện ích
    roomsAvailable, // Lưu mảng roomsAvailable
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
