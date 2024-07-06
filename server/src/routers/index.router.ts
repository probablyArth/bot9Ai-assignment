import { Router } from 'express';
import ChatRouter from './chat.router';

const ApiRouter = Router();

ApiRouter.use('/chat', ChatRouter);

export default ApiRouter;
