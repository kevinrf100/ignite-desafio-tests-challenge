import 'reflect-metadata';
import 'express-async-errors';

import express from 'express';
import cors from 'cors';

import './database';
import './shared/container';
import { router } from './routes';
import { AppError } from './shared/errors/AppError';
import { createConnections } from 'typeorm';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

createConnections().then(() => console.log('Connected'));

app.use(
  (err: Error, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.log(err)
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        message: err.message
      });
    }

    return response.status(500).json({
      status: "error",
      message: `Internal server error - ${err.message} `,
    });
  }
);

export { app };
