const express = require('express');
const router = express.Router();
const Coach = require('../models/Coach');

router.get('/', async (req,res)=> {
  const data = await Coach.find();
  res.json(data);
});

router.post('/', async (req,res)=> {
  const item = await Coach.create(req.body);
  res.json(item);
});

router.patch('/:id', async (req,res)=> {
  const item = await Coach.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', async (req,res)=> {
  await Coach.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
