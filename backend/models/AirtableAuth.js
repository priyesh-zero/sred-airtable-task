const mongoose = require("mongoose");

const AirtableAuthSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: String,
  accessToken: String,
  connectedAt: Date
});

module.exports = mongoose.model("AirtableAuth", AirtableAuthSchema, "airtable_auth");
