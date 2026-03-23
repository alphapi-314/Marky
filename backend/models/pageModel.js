import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
    {
        page_id: {
            type: Number,
            required: true,
            unique: true,
            autoIncrement: true
        },
        authorName: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        contentID: {
            type: Number,
            required: true,
            unique: true,
        },
        count: {
            type: Number,
            required: true,
            default: 0
        },
        comments: {
            type: Array,
            default: []
        },
        embeddings: {
            type: [Number],
            default: [],
            select: false
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const pageModel = mongoose.model.pages || mongoose.model("pages", pageSchema);
export default pageModel;
