const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

router.get('/', async (req,res)=> {
  const data = await Equipment.find();
  res.json(data);
});

router.post('/', async (req,res)=> {
  const item = await Equipment.create(req.body);
  res.json(item);
});

router.patch('/:id', async (req,res)=> {
  const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', async (req,res)=> {
  await Equipment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
