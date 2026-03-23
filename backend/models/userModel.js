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
            type: [Number],
            default: []
        },
        savedPages: {
            type: [Number],
            default: []
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const userModel = mongoose.models.users || mongoose.model("users", userSchema);
export default userModel;