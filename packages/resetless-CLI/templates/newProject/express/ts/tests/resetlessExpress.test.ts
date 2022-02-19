import { Resetless } from '@resetless/core';
import express, { RequestHandler } from 'express';
import request from 'supertest';

describe('Resetless with Express', () => {
  test('allows to dynamicly change implementation for module during runtime', async () => {
    const rl = new Resetless();
    const app = express();

    rl.addImplementationForModule(
      '/',
      `(req, res) => {
          return res.json({ value: 1 });
        };`,
    );

    app.get('/', (req, res, next) =>
      rl.getModuleFunction<RequestHandler>('/')(req, res, next),
    );

    const response = await request(app)
      .get('/')
      .expect(200);
    expect(response.body).toEqual({ value: 1 });

    rl.addImplementationForModule(
      '/',
      `(req, res) => {
        return res.json({ value: 2 });
      };`,
    );

    const secondResponse = await request(app)
      .get('/')
      .expect(200);
    expect(secondResponse.body).toEqual({ value: 2 });
  });
});
