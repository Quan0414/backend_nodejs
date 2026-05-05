import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const adminController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            // Excluding password and role (or you can include role)
            const users = await User.find().select('-password');
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Create a new user (Admin explicitly creates someone)
    createUser: async (req, res) => {
        try {
            const { username, email, password, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email is already registered' });
            }

            const user = await User.create({ username, email, password, role: role || 'user' });

            // Don't send back password
            user.password = undefined;

            res.status(201).json({ success: true, message: 'User created successfully', data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Update user (Admin updates details)
    updateUser: async (req, res) => {
        try {
            const { username, email, password, role } = req.body;
            const updateFields = {};

            if (username) updateFields.username = username;
            if (email) updateFields.email = email;
            if (role) updateFields.role = role;
            
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateFields.password = await bcrypt.hash(password, salt);
            }

            const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
                new: true,
                runValidators: true
            }).select('-password');

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ success: true, message: 'User updated successfully', data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default adminController;
