const express = require('express');
const router = express.Router();
const { getScan } = require('../store/scanStore');
const { generatePDF } = require('../services/reportService');

router.get('/:id/pdf', (req, res) => {
  const scan = getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  if (scan.status !== 'completed') {
    return res.status(400).json({ error: 'Scan not yet complete' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="scan-${req.params.id}.pdf"`);

  const stream = generatePDF(scan);
  stream.pipe(res);
});

module.exports = router;
