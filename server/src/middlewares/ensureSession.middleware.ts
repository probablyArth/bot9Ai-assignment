import { NextFunction, Request, Response } from 'express';

const ensureSession = () => (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeaders = req.headers['authorization'];
    if (!authorizationHeaders || !authorizationHeaders.startsWith('Bearer ')) {
      throw new Error('Invalid session token');
    }

    const sessionToken = authorizationHeaders.split('Bearer ')[1];
    if (!sessionToken) {
      throw new Error('Invalid session token');
    }
    req.sessionToken = sessionToken;
    next();
  } catch (_: unknown) {
    return res.status(401).send({ message: 'Invalid session token' });
  }
};

export default ensureSession;
