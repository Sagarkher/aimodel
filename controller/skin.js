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



const addSkinColor = async (req, res) => {
    try {
        const { genderId, colorName, image } = req.body;

        if (!genderId || !colorName || !image) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        const query = "INSERT INTO skincolors (genderId, colorName, image) VALUES (?, ?, ?)";
        const values = [genderId, colorName, image]; // Store Base64 image

        const [result] = await db.query(query, values);
        const [newSkinColor] = await db.query("SELECT * FROM skincolors WHERE id = ?", [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Skin color added successfully",
            data: newSkinColor[0],
        });
    } catch (error) {
        console.error("Error adding skin color:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getSkinColors = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM skincolors");
        res.status(200).json({ status: "true", data: rows });
    } catch (error) {
        console.error("Error fetching skin colors:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getSkinColorById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM skincolors WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ status: "false", message: "Skin color not found" });
        }

        res.status(200).json({ status: "true", data: rows[0] });
    } catch (error) {
        console.error("Error fetching skin color:", error);
        res.status(500).json({ message: "Server error" });
    }
};




module.exports = { addSkinColor, getSkinColors, getSkinColorById };