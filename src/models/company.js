const express = require('express');
const router = express.Router();
const Company = require('../models/company');
const User = require('../models/user');
const Order = require('../models/order');

router.post('/', async (req, res) => {
  const { firmaId, navn } = req.body;
  try {
    const company = new Company({ _id: firmaId, navn });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke opprette firma.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    const result = await Promise.all(companies.map(async (c) => {
      const brukere = await User.find({ firmaId: c._id });
      const arbeidsordre = await Order.find({ firmaId: c._id });
      return { id: c._id, navn: c.navn, brukere, arbeidsordre };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke hente data.' });
  }
});

router.delete('/', async (req, res) => {
  const { firmaId } = req.body;
  try {
    await Company.deleteOne({ _id: firmaId });
    await User.deleteMany({ firmaId });
    await Order.deleteMany({ firmaId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke slette firma.' });
  }
});

module.exports = router;
