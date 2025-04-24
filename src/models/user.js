const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firmaId: { type: String, required: true }, // match med company._id
  brukernavn: { type: String, required: true },
  passord: { type: String, required: true },
  rolle: { type: String, required: true }
});

module.exports = mongoose.model("User", UserSchema);
