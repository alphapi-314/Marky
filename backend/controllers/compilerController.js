import { Parser } from "../compiler/parser.js";
import pageDataModel from "../models/pageDataModel.js";
import pageModel from "../models/pageModel.js";
import User from "../models/userModel.js";
import { generateEmbedding } from "../utils/embedding.js";

export class CompilerController {

    preview = async (req, res) => {
        try {
            const { text, file, title } = req.body;
            let content;
            if (file) {
                content = fs.readFileSync(file, 'utf-8');
            }
            else if (text) {
                content = text;
            }
            else {
                return res.status(400).json({ success: false, message: "No text provided" });
            }
            if (title) {
                content = title + "\n" + content;
            }
            const parser = new Parser();
            const ast = parser.parse(content).toJSON();
            return res.status(200).json({ success: true, ast });
        } catch (error) {
            console.error("Preview error:", error);
            res.status(500).json({ success: false, message: "Error parsing markdown" });
        }
    };

    submit = async (req, res) => {
        try {
            const { userId, text, title } = req.body;
            if (!text || !title) {
                return res.status(400).json({ success: false, message: "Title and Content are required" });
            }

            const parser = new Parser();
            const ast = parser.parse(text).toJSON();

            const contentID = Date.now() + Math.floor(Math.random() * 1000);
            const page_id = Date.now() + Math.floor(Math.random() * 1000);

            let resolvedAuthorName;
            if (userId) {
                const user = await User.findById(userId);
                if (user) {
                    resolvedAuthorName = user.authorName || user.username;
                }
            }

            const newPageData = new pageDataModel({
                id: contentID,
                content: ast
            });
            await newPageData.save();

            const embeddings = await generateEmbedding(text);

            const newPage = new pageModel({
                page_id,
                authorName: resolvedAuthorName,
                title,
                contentID,
                embeddings
            });
            await newPage.save();

            if (userId) {
                const user = await User.findById(userId);
                if (user && !user.ownedPages.includes(page_id)) {
                    user.ownedPages.push(page_id);
                    await user.save();
                }
            }

            return res.status(201).json({
                success: true,
                message: "Page submitted successfully",
                page: { page_id, title, authorName: resolvedAuthorName }
            });
        } catch (error) {
            console.error("Submit error:", error);
            res.status(500).json({ success: false, message: "Error saving page" });
        }
    };
}
