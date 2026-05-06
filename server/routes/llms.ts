import express from 'express';
import { buildLlmsTxt, buildLlmsFullTxt, buildAiTxt } from '../../src/lib/aeo.mjs';

export const llmsRouter = express.Router();

llmsRouter.get('/llms.txt', async (_req, res) => {
  try {
    const content = await buildLlmsTxt();
    res.type('text/markdown').send(content);
  } catch (err) {
    res.status(500).send('Failed to generate llms.txt');
  }
});

llmsRouter.get('/llms-full.txt', async (_req, res) => {
  try {
    const content = await buildLlmsFullTxt();
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(500).send('Failed to generate llms-full.txt');
  }
});

llmsRouter.get('/ai.txt', (_req, res) => {
  try {
    const content = buildAiTxt();
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(500).send('Failed to generate ai.txt');
  }
});
