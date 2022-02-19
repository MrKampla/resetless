import { Resetless } from '@resetless/core';
import express, { Request, RequestHandler, Response } from 'express';
import {
  initializeModuleInfoEndpoint,
  initializeModuleUpdateEndpoint,
} from './resetlessExpressEndpoints';
import 'dotenv/config';

const app = express();
app.use(express.json());

const rl = new Resetless();

const handler = (_req: Request, res: Response) => {
  res.json({ value: 1 });
};

rl.addImplementationForModule('/', handler.toString());

initializeModuleInfoEndpoint(app, rl, {
  password: process.env.RESETLESS_MODULE_INFO_PASSWORD ?? 'pass',
});
initializeModuleUpdateEndpoint(app, rl, {
  password: process.env.RESETLESS_MODULE_UPDATE_PASSWORD ?? 'pass',
});

app.get('/', (req, res, next) =>
  rl.getModuleFunction<RequestHandler>('/')(req, res, next),
);

app.listen(8080, () => console.log('Listening on 8080'));
