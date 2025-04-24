require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// MongoDB-tilkobling
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Importer modeller
const Company = require("./src/models/company");
const User = require("./src/models/user");
const Order = require("./src/models/order");

// Importer ruter
const companyRoutes = require("./src/routes/api/company");
const userRoutes = require("./src/routes/api/user");
const orderRoutes = require("./src/routes/api/order");

app.use("/api/company", companyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/arbeidsordre", orderRoutes);

// Login-rute
app.post("/api/auth/login", async (req, res) => {
  const firmaId = req.body.firmaId?.trim().toLowerCase();
  const brukernavn = req.body.brukernavn?.trim();
  const passord = req.body.passord;

  if (!firmaId || !brukernavn || !passord) {
    return res.status(400).json({ message: "Manglende innloggingsdata." });
  }

  try {
    console.log("🔐 Login attempt:", firmaId, brukernavn);

    const company = await Company.findOne({ firmaId });
    if (!company) {
      console.log("❌ Firma ikke funnet:", firmaId);
      return res.status(400).json({ message: "Firmaet finnes ikke." });
    }

    const user = await User.findOne({
      firmaId: company.firmaId,
      brukernavn: new RegExp(`^${brukernavn}$`, "i"),
    });

    if (!user || user.passord !== passord) {
      console.log("❌ Feil brukernavn/passord:", brukernavn);
      return res.status(400).json({ message: "Feil brukernavn eller passord." });
    }

    console.log("✅ Login OK:", user.brukernavn);
    res.json({ firmaId: user.firmaId, brukernavn: user.brukernavn, rolle: user.rolle });
  } catch (err) {
    console.error("💥 Login serverfeil:", err);
    res.status(500).json({ message: "Serverfeil ved innlogging." });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
