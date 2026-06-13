const PDFDocument = require('pdfkit');

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#65a30d',
};

function generatePDF(scan) {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(24).text('Security Scan Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555')
    .text(`Scan ID: ${scan.id}`, { align: 'center' })
    .text(`Target: ${scan.target}`, { align: 'center' })
    .text(`Completed: ${scan.completedAt}`, { align: 'center' });
  doc.moveDown();

  if (scan.summary) {
    doc.fontSize(16).fillColor('#000').text('Summary');
    doc.moveDown(0.3);
    doc.fontSize(12).text(`Total findings: ${scan.summary.total}`);
    for (const sev of ['critical', 'high', 'medium', 'low']) {
      if (scan.summary[sev]) {
        doc.fillColor(SEVERITY_COLORS[sev]).text(`${sev[0].toUpperCase() + sev.slice(1)}: ${scan.summary[sev]}`);
      }
    }
    doc.fillColor('#000').moveDown();
  }

  doc.fontSize(16).text('Findings');
  doc.moveDown(0.3);

  for (const finding of scan.findings) {
    const color = SEVERITY_COLORS[finding.severity] || '#333';
    doc.fontSize(12).fillColor(color)
      .text(`[${finding.severity.toUpperCase()}] ${finding.title}`);
    doc.fontSize(10).fillColor('#333').text(finding.description);
    if (finding.location) {
      doc.fillColor('#666').text(`Location: ${finding.location}`);
    }
    if (finding.cveId) {
      doc.fillColor('#888').text(`CVE: ${finding.cveId}${finding.score ? ` (CVSS ${finding.score})` : ''}`);
    }
    doc.moveDown(0.5);
  }

  doc.end();
  return doc;
}

module.exports = { generatePDF };
