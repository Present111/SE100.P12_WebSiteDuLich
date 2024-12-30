const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer');

cloudinary.config({ 
  cloud_name: 'dxtslecpc', 
  api_key: '378364589594615', 
  api_secret: 'x2vmAq4Xy0EXdu3d0UpeG0eFIh4'
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params:{
    folder: 'shopcaulonguit', 
    public_id: (req, file) => file.originalname.split('.')[0]
  },
  filename: function (req, res, cb) {
    cb(null, res.originalname); 
  }
});


module.exports = multer({ storage })