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


const addEyeColor = async (req, res) => {
    try {
        const { genderId, colorName, image } = req.body;

        // Validate Inputs
        if (!genderId || !colorName || !image) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        // Insert Data into MySQL
        const query = `INSERT INTO eyecolors (genderId, colorName, image) VALUES (?, ?, ?)`;
        const values = [genderId, colorName, image];

        const [result] = await db.query(query, values);

        // Fetch the newly inserted record
        const [newEyeColor] = await db.query(`SELECT * FROM eyecolors WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Eye color added successfully",
            data: newEyeColor[0]
        });

    } catch (error) {
        console.error("Error adding eye color:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getEyeColors = async (req, res) => {
    try {
        const [eyeColors] = await db.query(`SELECT * FROM eyecolors`);

        res.status(200).json({
            status: "true",
            message: "Eye colors fetched successfully",
            data: eyeColors
        });

    } catch (error) {
        console.error("Error fetching eye colors:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateEyeColor = async (req, res) => {
    try {
        const { genderId, colorName, image } = req.body;
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        // Prepare update fields dynamically
        const updateFields = [];
        const values = [];

        if (genderId) {
            updateFields.push("genderId = ?");
            values.push(genderId);
        }

        if (colorName) {
            updateFields.push("colorName = ?");
            values.push(colorName);
        }

        if (image) {
            updateFields.push("image = ?");
            values.push(image);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ status: "false", message: "No fields to update" });
        }

        values.push(id);
        const updateQuery = `UPDATE eyecolors SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.query(updateQuery, values);

        const [updatedEyeColor] = await db.query(`SELECT * FROM eyecolors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Eye color updated successfully",
            data: updatedEyeColor[0]
        });

    } catch (error) {
        console.error("Error updating eye color:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteEyeColor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        await db.query(`DELETE FROM eyecolors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Eye color deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting eye color:", error);
        res.status(500).json({ message: "Server error" });
    }
};






module.exports = { addEyeColor, getEyeColors, updateEyeColor, deleteEyeColor };
