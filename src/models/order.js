const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  firmaId: {
    type: String,
    required: true
  },
  ordreId: {
    type: String,
    required: true
  },
  beskrivelse: {
    type: String,
    required: true
  },
  varer: {
    type: Array,
    default: []
  },
  opprettet: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
