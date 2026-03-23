import pageModel from "../models/pageModel.js";
import pageDataModel from "../models/pageDataModel.js";
import commentModel from "../models/commentModel.js";
import User from "../models/userModel.js";
import { generateEmbedding } from "../utils/embedding.js";

export class pageController {

    getPage = async (req, res) => {
        try {
            const { page_id } = req.params;
            const page = await pageModel.findOne({ page_id: Number(page_id) });
            if (!page) {
                return res.status(404).json({ success: false, message: "Page not found" });
            }

            page.count += 1;
            await page.save();

            const parsedData = await pageDataModel.findOne({ id: page.contentID });
            res.status(200).json({
                success: true,
                page: {
                    ...page.toObject(),
                    parsedContent: parsedData ? parsedData.content : null
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error fetching page" });
        }
    };

    getComments = async (req, res) => {
        try {
            const { page_id } = req.params;
            const comments = await commentModel.find({ page_id: Number(page_id) }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, comments });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error fetching comments" });
        }
    };

    postComment = async (req, res) => {
        try {
            const { page_id } = req.params;
            const { userId, content, parentID } = req.body;

            if (!content) {
                return res.status(400).json({ success: false, message: "Comment content is required" });
            }

            const page = await pageModel.findOne({ page_id: Number(page_id) });
            if (!page) {
                return res.status(404).json({ success: false, message: "Page not found" });
            }

            let authorName = "Anonymous";
            if (userId) {
                const user = await User.findById(userId);
                if (user) {
                    authorName = user.authorName || user.username || authorName;
                }
            }

            const comment_id = Date.now() + Math.floor(Math.random() * 1000);

            const newComment = new commentModel({
                comment_id,
                page_id: Number(page_id),
                authorName,
                content,
                parentID: parentID ? Number(parentID) : null
            });

            await newComment.save();

            if (parentID) {
                const parentComment = await commentModel.findOne({ comment_id: Number(parentID) });
                if (parentComment) {
                    parentComment.comments.push(newComment.comment_id);
                    await parentComment.save();
                }
            } else {
                page.comments.push(newComment.comment_id);
                await page.save();
            }

            res.status(201).json({ success: true, message: "Comment posted", comment: newComment });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error posting comment" });
        }
    };

    searchPages = async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ success: false, message: "Search query required" });
            }

            const queryEmbedding = await generateEmbedding(query);

            const results = await pageModel.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embeddings",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 10
                    }
                },
                {
                    $project: {
                        embeddings: 0,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            res.status(200).json({ success: true, results });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error searching pages" });
        }
    };

}