/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="global.d.ts" />

import getEnvVar, { parseEnv } from './env';
parseEnv();
import Express from 'express';
import cors from 'cors';
import { Sequelize } from '@sequelize/core';
import ensureSession from 'middlewares/ensureSession.middleware';
import logger from 'middlewares/logger.middleware';
import ApiRouter from 'routers/index.router';
import { Conversation } from 'models/conversation';

const app = Express();

app.use(cors({ origin: getEnvVar('CLIENT_ORIGIN_URL') }));
app.use(Express.json());
app.use(logger());
app.get('/', (_, res) => {
  res.json({ ok: true });
});
app.use(ensureSession());
app.use('/api', ApiRouter);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  models: [Conversation],
});

sequelize
  .sync()
  .then(() => {
    console.log('DB connected');
    app.listen(getEnvVar('PORT'), () => {
      console.log(`Server is running on http://localhost:${getEnvVar('PORT')}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Unable to connect to the database:', error);
  });
