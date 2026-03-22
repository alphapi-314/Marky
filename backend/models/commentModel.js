import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        comment_id: {
            type: Number,
            required: true,
            unique: true,
            autoIncrement: true
        },
        page_id: {
            type: Number,
            required: true
        },
        authorName: {
            type: String,
            required: true,
            trim: true
        },
        count: {
            type: Number,
            required: true,
            default: 0
        },
        parentID: {
            type: Number,
            default: null
        },
        comments: {
            type: Array,
            default: []
        },
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const commentModel = mongoose.model.comments || mongoose.model("comments", commentSchema);
export default commentModel;