const mongoose = require("mongoose");
const { Schema } = mongoose;

const TicketSchema = new mongoose.Schema({
  id: { type: String, required: true },
  createdTime: { type: Date, required: true },
  fields: { type: Schema.Types.Mixed, required: false },
});

exports.TicketSchema = mongoose.model(
  "Ticket",
  TicketSchema,
  "airtable_tickets",
);
