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

// Mongoose-skjemaer
const CompanySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  navn: { type: String, required: true },
  jobbvareuttak: { type: String, default: "" },
  opprettet: { type: Date, default: Date.now },
});
const Company = mongoose.model("Company", CompanySchema);

const UserSchema = new mongoose.Schema({
  firmaId: { type: String, required: true },
  brukernavn: { type: String, required: true },
  passord: { type: String, required: true },
  rolle: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const OrderSchema = new mongoose.Schema({
  firmaId: { type: String, required: true },
  ordreId: { type: String, required: true },
  beskrivelse: { type: String, required: true },
  varer: { type: Array, default: [] },
  opprettet: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", OrderSchema);

// Opprett firma
app.post("/api/company", async (req, res) => {
  const firmaId = req.body.firmaId?.trim().toLowerCase();
  const navn = req.body.navn?.trim();
  if (!firmaId || !navn) return res.status(400).json({ message: "firmaId og navn må være med" });

  try {
    const eksisterer = await Company.findById(firmaId);
    if (eksisterer) return res.status(400).json({ message: "Firma-ID finnes allerede" });

    const company = new Company({ _id: firmaId, navn });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    console.error("Feil ved oppretting av firma:", err);
    res.status(500).json({ message: "Kunne ikke opprette firma." });
  }
});

// Hent firmaer m/brukere og arbeidsordre
app.get("/api/company", async (req, res) => {
  try {
    const companies = await Company.find();
    const result = await Promise.all(
      companies.map(async (c) => {
        const brukere = await User.find({ firmaId: c._id });
        const arbeidsordre = await Order.find({ firmaId: c._id });
        return { id: c._id, navn: c.navn, brukere, arbeidsordre };
      })
    );
    res.json(result);
  } catch (err) {
    console.error("Feil ved henting av firmaer:", err);
    res.status(500).json({ message: "Kunne ikke hente firmaer." });
  }
});

// Opprett bruker
app.post("/api/user", async (req, res) => {
  const firmaId = req.body.firmaId?.trim().toLowerCase();
  const brukernavn = req.body.brukernavn?.trim();
  const passord = req.body.passord;
  const rolle = req.body.rolle;
  try {
    const company = await Company.findById(firmaId);
    if (!company) return res.status(400).json({ message: "Firmaet finnes ikke" });

    const user = new User({ firmaId, brukernavn, passord, rolle });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Kunne ikke opprette bruker.' });
  }
});

// Hent alle brukere
app.get("/api/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Feil ved henting av brukere:", err);
    res.status(500).json({ message: "Kunne ikke hente brukere." });
  }
});

// Slett bruker
app.delete("/api/user", async (req, res) => {
  const { firmaId, brukernavn } = req.body;
  try {
    await User.deleteOne({ firmaId, brukernavn });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Kunne ikke slette bruker." });
  }
});

// Slett firma
app.delete("/api/company", async (req, res) => {
  const { firmaId } = req.body;
  try {
    await Company.deleteOne({ _id: firmaId });
    await User.deleteMany({ firmaId });
    await Order.deleteMany({ firmaId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Kunne ikke slette firma." });
  }
});

// Opprett arbeidsordre
app.post("/api/arbeidsordre", async (req, res) => {
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
app.delete("/api/arbeidsordre", async (req, res) => {
  const { firmaId, ordreId } = req.body;
  try {
    await Order.deleteOne({ firmaId, ordreId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Kunne ikke slette arbeidsordre." });
  }
});

// Oppdater varer i ordre
app.put("/api/arbeidsordre/:ordreId", async (req, res) => {
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
app.get("/api/arbeidsordre/ordre/:ordreId", async (req, res) => {
  try {
    const ordre = await Order.findOne({ ordreId: req.params.ordreId });
    if (!ordre) return res.status(404).json({ message: "Ordre ikke funnet" });
    res.json(ordre);
  } catch (err) {
    res.status(500).json({ message: "Feil ved henting av ordre" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  console.log("🛬 Mottok POST /api/auth/login");

  const firmaId = req.body.firmaId?.trim().toLowerCase();
  const brukernavn = req.body.brukernavn?.trim();
  const passord = req.body.passord;

  if (!firmaId || !brukernavn || !passord) {
    return res.status(400).json({ message: "Manglende innloggingsdata." });
  }

  try {
    console.log("🔐 Login attempt:", firmaId, brukernavn);

    const alleFirmaer = await Company.find();
    console.log("📂 Firmaer i databasen:", alleFirmaer.map(f => f._id));

    console.log("🔍 Forsøker å finne firma med _id:", firmaId);
    const company = await Company.findById(firmaId);
    if (!company) {
      console.log("❌ Firma ikke funnet:", firmaId);
      return res.status(400).json({ message: 'Firmaet finnes ikke.' });
    }

    const user = await User.findOne({
      firmaId: company._id,
      brukernavn: new RegExp(`^${brukernavn}$`, 'i'),
    });

    if (!user || user.passord !== passord) {
      console.log("❌ Feil brukernavn/passord:", brukernavn);
      return res.status(400).json({ message: 'Feil brukernavn eller passord.' });
    }

    console.log("✅ Login OK:", user.brukernavn);
    res.json({ firmaId: user.firmaId, brukernavn: user.brukernavn, rolle: user.rolle });

  } catch (err) {
    console.error("💥 Login serverfeil:", err);
    res.status(500).json({ message: 'Serverfeil ved innlogging.' });
  }
});



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
