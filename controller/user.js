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


//Register User
const addUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        console.log(req.body, "-------------");

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ status: "false", message: 'Passwords do not match', data: [] });
        }

        // Check if user already exists (by email)
        const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: "false", message: 'User already exists with this email', data: [] });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const [result] = await db.query(
            'INSERT INTO user (name, email, password, confirmPassword) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, hashedPassword]
        );

        // Fetch the complete user data (including auto-generated ID)
        const [newUser] = await db.query('SELECT * FROM user WHERE id = ?', [result.insertId]);

        // Generate JWT Token for the newly registered user
        const token = jwt.sign({ id: newUser[0].id, email: newUser[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // // Add token to response data
        // newUser[0].token = token;
        // delete newUser[0].password; // Remove password before sending response
        // delete newUser[0].confirmPassword; // Remove confirmPassword as well

        // Send response with full user data
        res.status(201).json({
            status: "true",
            message: 'User registered successfully',
            data: newUser[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const addUserDetails = async (req, res) => {
    try {
        const { name, lastName, ethnicity, age } = req.body;

        // Validate Required Fields
        if (!name || !lastName || !ethnicity || !age) {
            return res.status(400).json({ status: "false", message: "All fields are required" });
        }

        // Insert Data into Database
        const query = `INSERT INTO user (name, lastName, ethnicity, age) VALUES (?, ?, ?, ?)`;
        const values = [name, lastName, ethnicity, age];

        const [result] = await db.query(query, values);

        // Fetch Newly Created User
        const [newUser] = await db.query(`SELECT id, name, lastName, ethnicity, age FROM user WHERE id = ?`, [result.insertId]);

        res.status(201).json({
            status: "true",
            message: "User details added successfully",
            data: newUser[0]
        });

    } catch (error) {
        console.error("Error adding user details:", error);
        res.status(500).json({ status: "false", message: "Server error", error: error.message });
    }
};


const editProfile = async (req, res) => {
    try {
        const id = req.query.id; 
        console.log("Received User ID:", id);

        const { firstName, lastName, phone, email, password, address, country, state, city, postal } = req.body;


        // Check if user exists
        const [existingUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ status: "false", message: 'User not found', data: [] });
        }

        // Handle Image Upload
        let image = existingUser[0].image; // Keep existing image if no new image is uploaded
        if (req.file) {
            image = `http://127.0.0.1:5002/upload/${req.file.filename}`;
        }

        // Hash password only if it's provided
        let hashedPassword = existingUser[0].password; // Keep existing password if no new one is provided
        if (password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Update user details in the database
        await db.query(
            'UPDATE user SET firstName = ?, lastName = ?, phone = ?, email = ?, password = ?, address = ?, country = ?, state = ?, city = ?, postal = ?, image = ? WHERE id = ?',
            [firstName, lastName, phone, email, hashedPassword, address, country, state, city, postal, image, id]
        );

        // Fetch updated user data
        const [updatedUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        res.status(200).json({
            status: "true",
            message: 'User updated successfully',
            data: updatedUser[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM user');

        if (users.length === 0) {
            return res.status(404).json({ status: "false", message: "No users found", data: [] });
        }

        res.status(200).json({ status: "true", message: "Users retrieved successfully", data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Get User by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found", data: [] });
        }

        res.status(200).json({ status: "true", message: "User retrieved successfully", data: user[0] });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const checkGoogleDetails = async (req, res) => {
    try {
        const { email, googleSignIn } = req.body;

        // Step 1: Validate Email
        if (!email) {
            return res.status(400).json({ status: "false", message: "Email is required", data: [] });
        }

        // Step 2: Fetch User
        const [existingUser] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);

        if (existingUser.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found with this email.", data: [] });
        }

        // Step 3: Prepare update fields dynamically
        const updateFields = [];
        const values = [];

        if (googleSignIn) {
            updateFields.push("googleSignIn = ?");
            values.push(googleSignIn);
        }

        // if (image) {
        //     updateFields.push("image = ?");
        //     values.push(image);
        // }

        // Step 4: Update the user if needed
        if (updateFields.length > 0) {
            values.push(email);
            const updateQuery = `UPDATE user SET ${updateFields.join(", ")} WHERE email = ?`;
            await db.execute(updateQuery, values);
        }

        // Step 5: Fetch Updated User Data (Ensuring Correct Column Name)
        const [updatedUser] = await db.execute('SELECT id, name, email, password, confirmPassword, googleSignIn FROM user WHERE email = ?', [email]);

        return res.status(200).json({
            status: "true",
            message: "Google details updated successfully",
            data: updatedUser[0]  // Only valid `googleSignIn` field will be returned
        });

    } catch (error) {
        console.error("Google Sign-In Error:", error);
        res.status(500).json({ status: "false", message: "Server error", error: error.message });
    }
};


//delete user
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params; 

        const [existingUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        if (existingUser.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found", data: [] });
        }
                
        await db.query('DELETE FROM user WHERE id = ?', [id]);

        res.status(200).json({
            status: "true",
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
};



const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const [user] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
        if (user.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found with this email." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and confirmPassword
        await db.query("UPDATE user SET password = ?, confirmPassword = ? WHERE email = ?", 
            [hashedPassword, hashedPassword, email]);

        res.status(200).json({ status: "true", message: "Password updated successfully." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ status: "false", message: "Server error" });
    }
};



// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [user] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // User Data with Hashed Password
        const userData = {
            id: user[0].id.toString(),
            //name: user[0].name,
            email: user[0].email,
            password: user[0].password,     
            token: token
        };

        res.json({ status: "true", message: 'Login successful', data: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};  



// Protected Route
const protectedRoute = (req, res) => {
    res.json({ message: 'You have accessed a protected route!', user: req.user });
};



// Export the functions
module.exports = { loginUser, addUser, editProfile, getAllUsers, getUserById, checkGoogleDetails, deleteUserById, forgotPassword, addUserDetails, protectedRoute };
