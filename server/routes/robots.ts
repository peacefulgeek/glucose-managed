import express from 'express';
import { buildRobotsTxt } from '../../src/lib/aeo.mjs';

export const robotsRouter = express.Router();

robotsRouter.get('/', (_req, res) => {
  res.type('text/plain').send(buildRobotsTxt());
});
