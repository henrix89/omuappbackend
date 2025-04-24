// src/routes/api/order.js

const express = require("express");
const router = express.Router();
const Order = require("../../models/order");

// Opprett arbeidsordre
router.post("/", async (req, res) => {
  const { firmaId, ordreId, beskrivelse } = req.body;
  try {
    const eksisterer = await Order.findOne({ firmaId, ordreId });
    if (eksisterer) return res.status(200).json(eksisterer);

    const ordre = new Order({ firmaId, ordreId, beskrivelse, varer: [] });
    await ordre.save();
    res.status(201).json(ordre);
  } catch (err) {
    res.status(500).json({ message: "Feil ved opprettelse av arbeidsordre" });
  }
});

// Slett arbeidsordre
router.delete("/", async (req, res) => {
  const { firmaId, ordreId } = req.body;
  try {
    await Order.deleteOne({ firmaId, ordreId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Kunne ikke slette arbeidsordre." });
  }
});

// Oppdater varer i ordre
router.put("/:ordreId", async (req, res) => {
  const { ordreId } = req.params;
  const { firmaId, varer } = req.body;
  try {
    await Order.findOneAndUpdate({ firmaId, ordreId }, { varer });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: "Feil ved lagring av varer" });
  }
});

// Hent én ordre
router.get("/ordre/:ordreId", async (req, res) => {
  try {
    const ordre = await Order.findOne({ ordreId: req.params.ordreId });
    if (!ordre) return res.status(404).json({ message: "Ordre ikke funnet" });
    res.json(ordre);
  } catch (err) {
    res.status(500).json({ message: "Feil ved henting av ordre" });
  }
});

module.exports = router;