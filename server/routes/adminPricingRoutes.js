const express = require('express');
const router = express.Router();
const PricingRule = require('../models/PricingRule');

router.get('/', async (req,res)=> {
  const data = await PricingRule.find().sort({ priority: -1 });
  res.json(data);
});

router.post('/', async (req,res)=> {
  const item = await PricingRule.create(req.body);
  res.json(item);
});

router.patch('/:id', async (req,res)=> {
  const item = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', async (req,res)=> {
  await PricingRule.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
