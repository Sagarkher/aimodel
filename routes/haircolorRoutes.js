const express = require('express');
const { addHairColor, getHairColors, updateHairColor,deleteHairColor } = require('../controller/haircolor');
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

router.post("/addHairColor", authMiddleware, addHairColor);
router.get("/getHairColors", authMiddleware, getHairColors);
router.patch("/updateHairColor/:id", authMiddleware, updateHairColor);
router.delete("/deleteHairColor/:id", authMiddleware, deleteHairColor)


module.exports = router; 
