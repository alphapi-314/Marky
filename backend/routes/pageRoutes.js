import express from 'express';
import { pageController } from '../controllers/pageController.js';
import authorize from '../middleware/auth.js';

const pageRouter = express.Router();
const controller = new pageController();

pageRouter.get('/search', controller.searchPages);
pageRouter.get('/:page_id', controller.getPage);
pageRouter.get('/:page_id/comments', controller.getComments);
pageRouter.post('/:page_id/comments', authorize, controller.postComment);

export default pageRouter;
