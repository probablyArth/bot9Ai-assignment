import { NextFunction, Request, Response } from 'express';

const ensureSession = () => (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeaders = req.headers['authorization'];
  if (!authorizationHeaders) {
    return res.status(401).send({ message: 'Invalid session token' });
  }
  const sessionToken = authorizationHeaders.split(' ')[1];

  if (!sessionToken) {
    return res.status(401).send({ message: 'Invalid session token' });
  }

  req.sessionToken = sessionToken;

  next();
};

export default ensureSession;
