const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  firmaId: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  ordreId: {
    type: String,
    required: true,
    trim: true,
  },
  beskrivelse: {
    type: String,
    required: true,
    trim: true,
  },
  varer: {
    type: Array,
    default: [],
  },
  opprettet: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
