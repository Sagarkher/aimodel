const express = require('express');
const { addRelationship, getRalationship, updateRelationship, deleteRelationship, getRelationshipById } = require('../controller/relationship');
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

router.post("/addRelationship", authMiddleware, addRelationship);
router.get("/getRalationship", authMiddleware, getRalationship);
router.get("/getRelationshipById/:id", authMiddleware, getRelationshipById);
router.patch("/updateRelationship/:id", authMiddleware, updateRelationship);
router.delete("/deleteRelationship/:id", authMiddleware, deleteRelationship);


module.exports = router; 
