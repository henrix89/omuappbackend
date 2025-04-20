const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Company = require("../models/company");

router.post("/login", async (req, res) => {
  const { firmaId, brukernavn, passord } = req.body;

  try {
    // Case-insensitiv søk på firma ID
    const firma = await Company.findOne({ _id: new RegExp(`^${firmaId}$`, 'i') });
    if (!firma) {
      return res.status(404).json({ message: "Firma finnes ikke." });
    }

    // Bruker må tilhøre samme firma, søk case-insensitivt
    const user = await User.findOne({
      firmaId: firma._id,
      brukernavn: new RegExp(`^${brukernavn}$`, 'i')
    });

    if (!user) {
      return res.status(404).json({ message: "Bruker ikke funnet." });
    }

    if (user.passord !== passord) {
      return res.status(401).json({ message: "Feil passord." });
    }

    res.json({
      firmaId: user.firmaId,
      brukernavn: user.brukernavn,
      rolle: user.rolle
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Serverfeil ved innlogging." });
  }
});

module.exports = router;
