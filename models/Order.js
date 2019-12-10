const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const OrderSchema = new mongoose.Schema({
  cname: {
    type: String,
    required: true
  },
  cemail: {
    type: String,
    required: true,
  },
  plocation: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  caddress: {
    type: String, 
    required: true
  },
  dlocation: {
    type: String, 
    required: true
  },
  vehicle: {
    type: String
  },
   gender: {
    type: String, 
    required: true
  },
  isAdmin: {
    type: Boolean, 
    default: false
  },
  cphone: {
    type: Number, 
    required: true
  }
});

const Order = mongoose.model('Order', OrderSchema);

OrderSchema.plugin(passportLocalMongoose);

module.exports = Order;