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

const addHairColor = async (req, res) => {
    try {
        const { genderId, colorName, image } = req.body;

        if (!genderId || !colorName || !image) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        const query = `INSERT INTO haircolors (genderId, colorName, image) VALUES (?, ?, ?)`;
        const values = [genderId, colorName, image];

        const [result] = await db.query(query, values);

        const [newHairColor] = await db.query(`SELECT * FROM haircolors WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Hair color added successfully",
            data: newHairColor[0]
        });

    } catch (error) {
        console.error("Error adding hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};




const getHairColors = async (req, res) => {
    try {
        const [hairColors] = await db.query(`SELECT * FROM haircolors`);

        res.status(200).json({
            status: "true",
            message: "Hair colors fetched successfully",
            data: hairColors
        });

    } catch (error) {
        console.error("Error fetching hair colors:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateHairColor = async (req, res) => {
    try {
        const { genderId, colorName, image } = req.body;
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

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
        const updateQuery = `UPDATE haircolors SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.query(updateQuery, values);

        const [updatedHairColor] = await db.query(`SELECT * FROM haircolors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Hair color updated successfully",
            data: updatedHairColor[0]
        });

    } catch (error) {
        console.error("Error updating hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const deleteHairColor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        await db.query(`DELETE FROM haircolors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Hair color deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { addHairColor, getHairColors, updateHairColor, deleteHairColor }
