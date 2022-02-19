import { Resetless } from '@resetless/core';
import { Express } from 'express';

export const initializeModuleUpdateEndpoint = (
  app: Express,
  rl: Resetless,
  { password, customEndpoint }: { password: string; customEndpoint?: string },
) => {
  app.post(customEndpoint ?? '/__moduleUpdate', (req, res) => {
    if (req.body?.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const { name, code, enableCaching } = req.body.module;
    if (!name || !code) {
      return res.status(400).json({
        reason: 'Module name or code has not been defined',
      });
    }

    return res.json(rl.addImplementationForModule(name, code, enableCaching ?? true));
  });
};

export const initializeModuleInfoEndpoint = (
  app: Express,
  rl: Resetless,
  { password, customEndpoint }: { password: string; customEndpoint?: string },
) => {
  app.get(customEndpoint ?? '/__moduleInfo', (req, res) => {
    if (req.body?.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    return res.json(rl.getCachedModulesInfo());
  });
};
