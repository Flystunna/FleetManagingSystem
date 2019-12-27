const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const RequestSchema = new mongoose.Schema({
  senderFullName: {
    type: String
  },
  senderLastName: {
    type: String
  },
  contactPhone: {
    type: Number
  },
  contactHomePhone: {
    type: Number
  },
  senderEmail: {
    type: String
  },
  senderOptionalEmail: {
    type: String
  },
  creationTime: {
    type: Date,
    default: Date.now
  },
  receiverFullName: {
    type: String
  },
  receiverLastName: {
    type: String
  },
  receiverPhone: {
    type: Number
  },
  receiverOptionalPhone: {
    type: Number
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  receiverEmail: {
    type: String
  },
  receiverOptionalEmail: {
    type: String
  },
  senderState: {
    type: String
  },
  senderAddress: {
    type: String
  },
  receiverState: {
    type: String
  },
  receiverAddress: {
    type: String
  },
  info: {
    type: String
  },
  pieces: {
    type: String
  },
  weight: {
    type: String
  },
  dimensions: {
    type: String
  },
  instructions: {
    type: String
  },
  time: {
    type: String
  }
});

const Request = mongoose.model("Request", RequestSchema);

RequestSchema.plugin(passportLocalMongoose);

module.exports = Request;
