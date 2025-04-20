const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/', async (req, res) => {
  const { firmaId, brukernavn, passord, rolle } = req.body;
  try {
    const user = new User({ firmaId, brukernavn, passord, rolle });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke opprette bruker.' });
  }
});

router.delete('/', async (req, res) => {
  const { firmaId, brukernavn } = req.body;
  try {
    await User.deleteOne({ firmaId, brukernavn });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke slette bruker.' });
  }
});

module.exports = router;
