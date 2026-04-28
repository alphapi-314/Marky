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
            const userId = req.userId;
            const { content, parentID } = req.body;

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
            let matchStage = {};

            if (query && query.trim() !== "") {
                matchStage = {
                    title: { $regex: query, $options: "i" }
                };
            }

            const results = await pageModel.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$title",
                        doc: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$doc" }
                },

                {
                    $sort: { createdAt: -1 }
                },

                {
                    $limit: 10
                }
            ]);

            res.status(200).json({
                success: true,
                results
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Error searching pages"
            });
        }
    };

    deletePage = async (req, res) => {
        try {
            const { page_id } = req.params;
            const page = await pageModel.findOne({ page_id: Number(page_id) });
            if (!page) {
                return res.status(404).json({ success: false, message: "Page not found" });
            }
            await page.deleteOne();
            res.status(200).json({ success: true, message: "Page deleted" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error deleting page" });
        }
    }

    deleteComment = async (req, res) => {
        try {
            const { comment_id } = req.params;
            const comment = await commentModel.findOne({ comment_id: Number(comment_id) });
            if (!comment) {
                return res.status(404).json({ success: false, message: "Comment not found" });
            }
            await comment.deleteOne();
            res.status(200).json({ success: true, message: "Comment deleted" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error deleting comment" });
        }
    }

    likePage = async (req, res) => {
        try {
            const { page_id } = req.params;
            const page = await pageModel.findOne({ page_id: Number(page_id) });
            if (!page) {
                return res.status(404).json({ success: false, message: "Page not found" });
            }
            page.likes += 1;
            await page.save();
            res.status(200).json({ success: true, message: "Page liked", page });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error liking page" });
        }
    }

    dislikePage = async (req, res) => {
        try {
            const { page_id } = req.params;
            const page = await pageModel.findOne({ page_id: Number(page_id) });
            if (!page) {
                return res.status(404).json({ success: false, message: "Page not found" });
            }
            page.dislikes += 1;
            await page.save();
            res.status(200).json({ success: true, message: "Page disliked", page });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error disliking page" });
        }
    }

    likeComment = async (req, res) => {
        try {
            const { comment_id } = req.params;
            const comment = await commentModel.findOne({ comment_id: Number(comment_id) });
            if (!comment) {
                return res.status(404).json({ success: false, message: "Comment not found" });
            }
            comment.likes += 1;
            await comment.save();
            res.status(200).json({ success: true, message: "Comment liked", comment });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error liking comment" });
        }
    }

    dislikeComment = async (req, res) => {
        try {
            const { comment_id } = req.params;
            const comment = await commentModel.findOne({ comment_id: Number(comment_id) });
            if (!comment) {
                return res.status(404).json({ success: false, message: "Comment not found" });
            }
            comment.dislikes += 1;
            await comment.save();
            res.status(200).json({ success: true, message: "Comment disliked", comment });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error disliking comment" });
        }
    }

    getAuthorPages = async (req, res) => {
        try {
            const { authorName } = req.params;
            const pages = await pageModel.find({ authorName });
            res.status(200).json({ success: true, pages });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Error fetching pages" });
        }
    }

}