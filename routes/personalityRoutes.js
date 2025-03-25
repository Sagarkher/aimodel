const express = require('express');
const { addPersonality, getPersonality, updatePersonality, deletePersonality, getPersonalityById } = require('../controller/personality');
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

router.post("/addPersonality", authMiddleware, addPersonality);
router.get("/getPersonality", authMiddleware, getPersonality);
router.get("/getPersonalityById/:id", authMiddleware, getPersonalityById);
router.patch("/updatePersonality/:id", authMiddleware, updatePersonality);
router.delete("/deletePersonality/:id", authMiddleware, deletePersonality);





module.exports = router; 
