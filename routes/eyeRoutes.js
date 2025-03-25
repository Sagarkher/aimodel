const express = require('express');
const { addEyeColor, getEyeColors, updateEyeColor, deleteEyeColor } = require('../controller/eye');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');  // Specify the folder where images will be stored
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);  // Get file extension
        const fileName = Date.now() + fileExtension;  // Use a unique name
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();


router.post("/addEyeColor", authMiddleware, addEyeColor);
router.get("/getEyeColors", authMiddleware, getEyeColors);
router.patch("/updateEyeColor/:id", authMiddleware, updateEyeColor);
router.delete("/deleteEyeColor/:id", authMiddleware, deleteEyeColor);




module.exports = router; 


