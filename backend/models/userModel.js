import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        authorName: {
            type: String,
            trim: true
        },
        ownedPages: {
            type: Array,
            default: []
        },
        savedPages: {
            type: Array,
            default: []
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const userModel = mongoose.model.users || mongoose.model("users", userSchema);
export default userModel;