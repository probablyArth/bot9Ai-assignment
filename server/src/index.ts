/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="global.d.ts" />

import getEnvVar, { parseEnv } from './env';
parseEnv();
import Express from 'express';
import cors from 'cors';
import { Sequelize } from '@sequelize/core';
import ensureSession from 'middlewares/ensureSession.middleware';
import logger from 'middlewares/logger.middleware';

const app = Express();

app.use(cors({ origin: getEnvVar('CLIENT_ORIGIN_URL') }));
app.use(Express.json());
app.use(logger());
app.use(ensureSession());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  database: 'bot9ai',
});

sequelize
  .authenticate()
  .then(() => {
    app.listen(getEnvVar('PORT'), () => {
      console.log(`Server is running on port ${getEnvVar('PORT')}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Unable to connect to the database:', error);
  });
