import express from 'express';
import { UserController } from '../controllers/userController.js';
import authorize from '../middleware/auth.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.put('/update-author', authorize, userController.updateAuthorName);
userRouter.post('/save-page', authorize, userController.savePage);
userRouter.post('/unsave-page', authorize, userController.unsavePage);
userRouter.get('/saved-pages', authorize, userController.getSavedPages);
userRouter.get('/owned-pages', authorize, userController.getOwnedPages);

export default userRouter;
