const db = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
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

const getAllGenders = async (req, res) => {
    try {
        const [genders] = await db.query('SELECT * FROM genders');

        if (genders.length === 0) {
            return res.status(404).json({ status: "false", message: "No gender found", data: [] });
        }

        res.status(200).json({ status: "true", message: "Users retrieved successfully", data: genders });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { getAllGenders };
