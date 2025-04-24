const express = require('express');
const router = express.Router();
const Company = require('../../models/company');
const User = require('../../models/user');
const Order = require('../../models/order');

router.post('/', async (req, res) => {
  const { firmaId, navn } = req.body;

  try {
    if (!firmaId || !navn) {
      return res.status(400).json({ message: "Firma-ID og navn er påkrevd." });
    }

    const normalizedId = firmaId.trim().toLowerCase();
    const eksisterer = await Company.findById(normalizedId);
    if (eksisterer) {
      return res.status(400).json({ message: "Firma-ID er allerede i bruk." });
    }

    const nyttFirma = new Company({ _id: normalizedId, navn: navn.trim() });
    await nyttFirma.save();

    res.status(201).json(nyttFirma);
  } catch (err) {
    console.error("❌ Feil ved opprettelse av firma:", err);
    res.status(500).json({ message: 'Kunne ikke opprette firma.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const firmaer = await Company.find();
    const resultat = await Promise.all(
      firmaer.map(async (firma) => {
        const brukere = await User.find({ firmaId: firma._id });
        const ordre = await Order.find({ firmaId: firma._id });
        return {
          _id: firma._id,
          navn: firma.navn,
          brukere,
          arbeidsordre: ordre,
        };
      })
    );
    res.json(resultat);
  } catch (err) {
    console.error("❌ Feil ved henting av firmaer:", err);
    res.status(500).json({ message: 'Kunne ikke hente firmaer.' });
  }
});

router.delete('/', async (req, res) => {
  const { firmaId } = req.body;

  try {
    if (!firmaId) {
      return res.status(400).json({ message: "Firma-ID må spesifiseres." });
    }

    const normalizedId = firmaId.trim().toLowerCase();

    await Company.deleteOne({ _id: normalizedId });
    await User.deleteMany({ firmaId: normalizedId });
    await Order.deleteMany({ firmaId: normalizedId });

    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Feil ved sletting av firma:", err);
    res.status(500).json({ message: 'Kunne ikke slette firma.' });
  }
});

module.exports = router;
