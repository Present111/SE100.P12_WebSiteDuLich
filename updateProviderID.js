const mongoose = require("mongoose");
const Provider = require("./models/Provider");
const Service = require("./models/Service");

// Kết nối đến MongoDB
mongoose.connect('mongodb+srv://22521118:qp101104@cluster0.pmshb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateServiceProviderID() {
  try {
    // Lấy tất cả providers
    const providers = await Provider.find();

    // Tạo một map providerID => ObjectId
    const providerMap = providers.reduce((acc, provider) => {
      acc[provider.providerID] = provider._id;
      return acc;
    }, {});

    // Cập nhật bảng services
    for (const providerID in providerMap) {
      const providerObjectId = providerMap[providerID];

      // Cập nhật tất cả các dịch vụ với providerID tương ứng
      await Service.updateMany(
        { providerID: providerID }, // Tìm các service với providerID là chuỗi
        { $set: { providerID: providerObjectId } } // Thay providerID bằng ObjectId
      );
    }

    console.log("Cập nhật thành công!");
  } catch (error) {
    console.error("Lỗi khi cập nhật providerID:", error);
  }
}

updateServiceProviderID().then(() => {
  mongoose.connection.close();
});
