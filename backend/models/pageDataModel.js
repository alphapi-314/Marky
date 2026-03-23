import mongoose from "mongoose";

const pageDataSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            autoIncrement: true
        },
        content: {
            type: Object,
            required: true
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const pageDataModel = mongoose.model.pageData || mongoose.model("pageData", pageDataSchema);
export default pageDataModel;
