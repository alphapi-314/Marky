import express from 'express';
import { CompilerController } from '../controllers/compilerController.js';
import authorize from '../middleware/auth.js';

const compilerRouter = express.Router();
const compilerController = new CompilerController();

compilerRouter.post('/preview', compilerController.preview);
compilerRouter.post('/submit', authorize, compilerController.submit);

export default compilerRouter;
