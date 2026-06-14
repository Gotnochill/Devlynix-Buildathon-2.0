const Scan = require('../models/Scan');

async function createScan(id, meta) {
  const doc = await Scan.create({
    id,
    status: 'queued',
    target: meta.target,
    type: meta.type,
    findings: [],
  });
  return doc.toObject();
}

async function getScan(id) {
  return Scan.findOne({ id }).lean();
}

async function updateScan(id, updates) {
  return Scan.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
}

async function addFinding(id, finding) {
  await Scan.updateOne({ id }, { $push: { findings: finding } });
  return finding;
}

module.exports = { createScan, getScan, updateScan, addFinding };
