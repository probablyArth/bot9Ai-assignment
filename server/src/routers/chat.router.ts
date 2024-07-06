import { Request, Response, Router } from 'express';
import { chat } from 'services/openai';
import { validateRequestBody } from 'validators/validateRequest';
import z from 'zod';

const ChatRouter = Router();

const postChatBodySchema = z.object({ message: z.string() });

type TPostChatBodyPayload = z.infer<typeof postChatBodySchema>;

ChatRouter.post('/', validateRequestBody(postChatBodySchema), async (req: Request<unknown, unknown, TPostChatBodyPayload>, res: Response) => {
  const chatResponse = await chat(req.sessionToken, 'auto', req.body.message);
  res.json(chatResponse);
});

export default ChatRouter;
