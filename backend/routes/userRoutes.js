import express from 'express';
import { UserController } from '../controllers/userController.js';
import authorize from '../middleware/auth.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/me', authorize, userController.getMe);
userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.put('/update-author', authorize, userController.updateAuthorName);
userRouter.post('/save-page', authorize, userController.savePage);
userRouter.post('/unsave-page', authorize, userController.unsavePage);
userRouter.get('/saved-pages', authorize, userController.getSavedPages);
userRouter.get('/owned-pages', authorize, userController.getOwnedPages);

userRouter.get('/profile/:page_id', userController.getProfile);
userRouter.put('/profile/:page_id', authorize, userController.updateProfile);
userRouter.get('/author-profile/:authorName', userController.getAuthorProfile);

export default userRouter;
