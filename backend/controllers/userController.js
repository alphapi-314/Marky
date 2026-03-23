import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pageModel from "../models/pageModel.js";

export class UserController {

    createToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    };

    signup = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
            });
            await newUser.save();
            const token = this.createToken(newUser._id);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                token,
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
            });
        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    login = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            let user;
            if (email) {
                user = await User.findOne({ email }).select("+password");
            }
            else {
                user = await User.findOne({ username }).select("+password");
            }

            if (!user) {
                return res.status(400).json({ message: "Invalid email or username" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid password" });
            }
            const token = this.createToken(user._id);
            res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                },
            });
        }
        catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    updateAuthorName = async (req, res) => {
        try {
            const { userId, authorName } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (authorName) user.authorName = authorName;
            await user.save();
            res.status(200).json({
                success: true,
                message: "User details updated successfully",
                user: {
                    _id: user._id,
                    username: user.username,
                    authorName: user.authorName,
                },
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    savePage = async (req, res) => {
        try {
            const { userId, page_id } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (user.savedPages.includes(page_id)) {
                return res.status(400).json({ success: false, message: "Page already saved" });
            }
            user.savedPages.push(page_id);
            await user.save();
            res.status(200).json({
                success: true,
                message: "Page saved successfully",
                user: {
                    _id: user._id,
                    username: user.username,
                    savedPages: user.savedPages,
                },
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    unsavePage = async (req, res) => {
        try {
            const { userId, page_id } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (!user.savedPages.includes(page_id)) {
                return res.status(400).json({ success: false, message: "Page not saved" });
            }
            user.savedPages = user.savedPages.filter((id) => id !== page_id);
            await user.save();
            res.status(200).json({
                success: true,
                message: "Page unsaved successfully",
                user: {
                    _id: user._id,
                    username: user.username,
                    savedPages: user.savedPages,
                },
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    getSavedPages = async (req, res) => {
        try {
            const { userId } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const pages = await pageModel.find({ page_id: { $in: user.savedPages } });

            res.status(200).json({
                success: true,
                message: "Saved pages fetched successfully",
                pages
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    getOwnedPages = async (req, res) => {
        try {
            const { userId } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const pages = await pageModel.find({ page_id: { $in: user.ownedPages } });

            res.status(200).json({
                success: true,
                message: "Owned pages fetched successfully",
                pages
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};
