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

const addHairStyle = async (req, res) => {
    try {
        const { genderId, styleName, image } = req.body;

        if (!genderId || !styleName || !image) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        const query = `INSERT INTO hairstyles (genderId, styleName, image) VALUES (?, ?, ?)`;
        const values = [genderId, styleName, image];

        const [result] = await db.query(query, values);

        const [newHairColor] = await db.query(`SELECT * FROM hairstyles WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Hair style added successfully",
            data: newHairColor[0]
        });

    } catch (error) {
        console.error("Error adding hair style:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getHairStyle = async (req, res) => {
    try {
        const [hairStyle] = await db.query(`SELECT * FROM hairstyles`);

        res.status(200).json({
            status: "true",
            message: "Hair colors fetched successfully",
            data: hairStyle
        });

    } catch (error) {
        console.error("Error fetching hair colors:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateHairStyle = async (req, res) => {
    try {
        const { genderId, styleName, image } = req.body;
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

        if (styleName) {
            updateFields.push("styleName = ?");
            values.push(styleName);
        }

        if (image) {
            updateFields.push("image = ?");
            values.push(image);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ status: "false", message: "No fields to update" });
        }

        values.push(id);
        const updateQuery = `UPDATE hairstyles SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.query(updateQuery, values);

        const [updatedHairStyle] = await db.query(`SELECT * FROM hairstyles WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Hair style updated successfully",
            data: updatedHairStyle[0]
        });

    } catch (error) {
        console.error("Error updating hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const deleteHairStyle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        await db.query(`DELETE FROM hairstyles WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Hair style deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { addHairStyle, getHairStyle, updateHairStyle, deleteHairStyle }
