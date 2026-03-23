import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export class UserController {

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
            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    email: newUser.email,
                },
            });
        } catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    login = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            let user;
            if (email) {
                user = await User.findOne({ email });
            }
            else {
                user = await User.findOne({ username });
            }

            if (!user) {
                return res.status(400).json({ message: "Invalid email or username" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid password" });
            }
            res.status(200).json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    username: user.username,
                },
            });
        }
        catch (error) {
            console.log("Error: " + error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    updateAuthorName = async (req, res) => {
        try {
            const { username, authorName } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (authorName) user.authorName = authorName;
            await user.save();
            res.status(200).json({
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
            const { username, page_id } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.savedPages.includes(page_id)) {
                return res.status(400).json({ message: "Page already saved" });
            }
            user.savedPages.push(page_id);
            await user.save();
            res.status(200).json({
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
            const { username, page_id } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!user.savedPages.includes(page_id)) {
                return res.status(400).json({ message: "Page not saved" });
            }
            user.savedPages = user.savedPages.filter((id) => id !== page_id);
            await user.save();
            res.status(200).json({
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
            const { username } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "Saved pages fetched successfully",
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
};
