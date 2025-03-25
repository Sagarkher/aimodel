const fs = require('fs');
const path = require('path');
const db = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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

const addBodyShape = async (req, res) => {
    try {
        const { genderId, shapeName, breastSize, buttSize, skinColorId, image } = req.body;

        if (!genderId || !shapeName || !breastSize || !buttSize || !skinColorId || !image) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        // Directly Store Base64 in MySQL
        const query = `INSERT INTO bodyshapes (genderId, shapeName, breastSize, buttSize, skinColorId, image) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [genderId, shapeName, breastSize, buttSize, skinColorId, image]; // Base64 string

        const [result] = await db.query(query, values);

        // Fetch the newly inserted record
        const [newBodyShape] = await db.query(`SELECT * FROM bodyshapes WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Body shape added successfully",
            data: newBodyShape[0] // Return inserted data
        });

    } catch (error) {
        console.error("Error adding body shape:", error);
        res.status(500).json({ message: "Server error" });
    }
};



const getAllBodyDetails = async (req, res) => {
    try {
        const [body] = await db.query('SELECT * FROM bodyshapes');

        if (body.length === 0) {
            return res.status(404).json({ status: "false", message: "No body found", data: [] });
        }

        res.status(200).json({ status: "true", message: "Users retrieved successfully", data: body });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { addBodyShape, getAllBodyDetails };
