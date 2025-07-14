const mongoose = require('mongoose');
const { Schema } = mongoose;

const RevisionSchema = new Schema({
  uuid: {
    type: String,
    required: true,
    unique: true, // Assuming UUIDs are globally unique
  },
  issueId: {
    type: String,
    required: true,
  },
  columnType: {
    type: String,
    enum: ['foreignKey', 'text', 'number', 'date', 'select'], // Extend as needed
    required: true,
  },
  columnName: {
    type: String,
    required: true,
  },
  oldValue: {
    type: Schema.Types.Mixed, // Can be string, null, number, etc.
    default: null,
  },
  newValue: {
    type: Schema.Types.Mixed,
    default: null,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  authoredBy: {
    type: String, // If this refers to a user ID, you might want to add a ref
    required: true,
  }
});

module.exports = mongoose.model('Revision', RevisionSchema, "airtable_revision");