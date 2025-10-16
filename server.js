import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Ensure DB is initialized on startup
import './db/index.js';

import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', router);

// 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nexa backend running on port ${PORT}`);
});


