const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createScan, getScan } = require('../store/scanStore');
const { runScan } = require('../services/scanOrchestrator');

router.post('/', async (req, res) => {
  const { target, type } = req.body;
  if (!target || !type) {
    return res.status(400).json({ error: 'target and type are required' });
  }
  if (!['url', 'github'].includes(type)) {
    return res.status(400).json({ error: 'type must be "url" or "github"' });
  }

  const id = uuidv4();
  const scan = await createScan(id, { target, type });

  runScan(id, target, type).catch(console.error);

  res.status(202).json({ scanId: id, status: scan.status });
});

router.get('/:id', async (req, res) => {
  const scan = await getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json(scan);
});

module.exports = router;
