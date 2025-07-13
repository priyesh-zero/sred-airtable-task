const mongoose = require("mongoose");
const { FieldSchema } = require("./_common");
const { Schema } = mongoose;

const ViewTypes = [
  "grid",
  "form",
  "calendar",
  "gallery",
  "kanban",
  "timeline",
  "block",
];

// Sub-schema: Date Dependency Settings
const DateDependencySettingsSchema = new Schema(
  {
    durationFieldId: { type: String, required: true },
    endDateFieldId: { type: String, required: true },
    isEnabled: { type: Boolean, required: true },
    predecessorFieldId: { type: String, default: null },
    reschedulingMode: {
      type: String,
      enum: ["flexible", "fixed", "none"],
      required: true,
    },
    shouldSkipWeekendsAndHolidays: { type: Boolean, required: true },
    startDateFieldId: { type: String, required: true },
    holidays: [{ type: String }], // ISO-formatted date strings
  },
  { _id: false },
);

// Sub-schema: View
const ViewSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ViewTypes, required: true },
    name: { type: String, required: true },
    visibleFieldIds: [{ type: String }],
  },
  { _id: false },
);

// Main Schema
const TableSchema = new Schema({
  id: { type: String, required: true },
  primaryFieldId: { type: String, required: true },
  dateDependencySettings: { type: DateDependencySettingsSchema },
  name: { type: String, required: true },
  description: { type: String },
  fields: { type: [FieldSchema], required: true },
  views: { type: [ViewSchema], required: true },
});

exports.TableSchema = mongoose.model("Table", TableSchema, "airtable_tables");
