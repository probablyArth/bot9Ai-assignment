import getEnvVar, { parseEnv } from './env';
parseEnv();
import Express from 'express';
import cors from 'cors';
import { Sequelize } from '@sequelize/core';

const app = Express();

app.use(cors({ origin: getEnvVar('CLIENT_ORIGIN_URL') }));

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
