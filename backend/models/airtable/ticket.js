const mongoose = require("mongoose");
const { FieldSchema } = require("./_common");

const TicketSchema = new mongoose.Schema({
  id: { type: String, required: true },
  createdTime: { type: Date, required: true },
  fields: { type: [FieldSchema], required: true },
});

exports.TicketSchema = mongoose.model(
  "Ticket",
  TicketSchema,
  "airtable_tickets",
);
