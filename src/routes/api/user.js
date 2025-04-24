const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Company = require('../../models/company');

router.post('/', async (req, res) => {
  const { firmaId, brukernavn, passord, rolle } = req.body;

  try {
    console.log("🔍 Søker etter firma med firmaId:", firmaId);
    const firma = await Company.findById(firmaId.trim().toLowerCase());

    if (!firma) {
      return res.status(400).json({ message: `Firma med firmaId '${firmaId}' finnes ikke.` });
    }

    const nyBruker = new User({
      firmaId: firma._id, // Bruker _id fra Company
      brukernavn,
      passord,
      rolle
    });

    await nyBruker.save();
    res.status(201).json(nyBruker);
  } catch (err) {
    console.error("❌ Feil ved opprettelse av bruker:", err);
    res.status(500).json({ message: 'Kunne ikke opprette bruker.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("❌ Feil ved henting av brukere:", err);
    res.status(500).json({ message: 'Kunne ikke hente brukere.' });
  }
});

module.exports = router;
