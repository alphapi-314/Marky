import express from 'express';
import { pageController } from '../controllers/pageController.js';
import authorize from '../middleware/auth.js';

const pageRouter = express.Router();
const controller = new pageController();

pageRouter.get('/search', controller.searchPages);
pageRouter.get('/author/:authorName', controller.getAuthorPages);
pageRouter.get('/:page_id', controller.getPage);
pageRouter.delete('/:page_id', authorize, controller.deletePage);
pageRouter.post('/:page_id/like', authorize, controller.likePage);
pageRouter.post('/:page_id/dislike', authorize, controller.dislikePage);

pageRouter.get('/:page_id/comments', controller.getComments);
pageRouter.post('/:page_id/comments', authorize, controller.postComment);
pageRouter.delete('/comments/:comment_id', authorize, controller.deleteComment);
pageRouter.post('/comments/:comment_id/like', authorize, controller.likeComment);
pageRouter.post('/comments/:comment_id/dislike', authorize, controller.dislikeComment);

export default pageRouter;
