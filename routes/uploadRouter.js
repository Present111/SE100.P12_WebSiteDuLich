const express = require('express');
const multer = require('../configs/config.cloudinary'); // Đường dẫn file cấu hình Cloudinary
const router = express.Router();

// Định nghĩa route upload
router.post('/', multer.single('image'), (req, res) => {
  try {
    console.log("HELLoHELLo")
    const file = req.file; // req.file chứa thông tin file upload
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully!',
      data: file,
    });
    console.log(file)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
    
  }
});

module.exports = router;
