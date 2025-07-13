const { Schema } = require("mongoose");

// Enums
const FieldTypes = [
  "singleLineText",
  "email",
  "url",
  "multilineText",
  "number",
  "percent",
  "currency",
  "singleSelect",
  "multipleSelects",
  "singleCollaborator",
  "multipleCollaborators",
  "multipleRecordLinks",
  "date",
  "dateTime",
  "phoneNumber",
  "multipleAttachments",
  "checkbox",
  "formula",
  "createdTime",
  "rollup",
  "count",
  "lookup",
  "multipleLookupValues",
  "autoNumber",
  "barcode",
  "rating",
  "richText",
  "duration",
  "lastModifiedTime",
  "button",
  "createdBy",
  "lastModifiedBy",
  "externalSyncSource",
  "aiText",
];

// Sub-schema: Field
const FieldSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: FieldTypes },
    name: { type: String, required: true },
    description: { type: String },
    options: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

module.exports = {
  FieldSchema,
};
