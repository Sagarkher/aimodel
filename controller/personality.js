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

const addPersonality = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        const query = `INSERT INTO personalityflavors (name) VALUES (?)`;
        const values = [name];

        const [result] = await db.query(query, values);

        const [newPersonality] = await db.query(`SELECT * FROM personalityflavors WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "Hair style added successfully",
            data: newPersonality[0]
        });

    } catch (error) {
        console.error("Error adding relationship:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getPersonality = async (req, res) => {
    try {
        const [personality] = await db.query(`SELECT * FROM personalityflavors`);

        res.status(200).json({
            status: "true",
            message: "Personality fetched successfully",
            data: personality
        });

    } catch (error) {
        console.error("Error fetching hair colors:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getPersonalityById = async (req, res) => {
    try {
        const { id } = req.params;
        const [data] = await db.query(`SELECT * FROM personalityflavors WHERE id = ?`, [id]);

        if (data.length === 0) {
            return res.status(404).json({ status: "false", message: "Personality not found" });
        }

        res.status(200).json({ status: "true", data: data[0] });
    } catch (error) {
        console.error("Error fetching personality:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updatePersonality = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        const updateFields = [];
        const values = [];

        if (name) {
            updateFields.push("name = ?");
            values.push(name);
        }

        // if (styleName) {
        //     updateFields.push("styleName = ?");
        //     values.push(styleName);
        // }

        // if (image) {
        //     updateFields.push("image = ?");
        //     values.push(image);
        // }

        if (updateFields.length === 0) {
            return res.status(400).json({ status: "false", message: "No fields to update" });
        }

        values.push(id);
        const updateQuery = `UPDATE personalityflavors SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.query(updateQuery, values);

        const [updatedPersonality] = await db.query(`SELECT * FROM personalityflavors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Personality updated successfully",
            data: updatedPersonality[0]
        });

    } catch (error) {
        console.error("Error updating hair color:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const deletePersonality = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: "false", message: "ID is required" });
        }

        await db.query(`DELETE FROM personalityflavors WHERE id = ?`, [id]);

        res.status(200).json({
            status: "true",
            message: "Personality deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting personality:", error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { addPersonality, getPersonality, updatePersonality, deletePersonality, getPersonalityById }