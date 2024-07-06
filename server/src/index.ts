import getEnvVar, { parseEnv } from './env';
parseEnv();
import Express from 'express';
import cors from 'cors';

const app = Express();
app.use(cors({ origin: getEnvVar('CLIENT_ORIGIN_URL') }));

app.listen(getEnvVar('PORT'), () => {
  console.log(`Server is running on port ${getEnvVar('PORT')}`);
});
