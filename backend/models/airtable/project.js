const { default: mongoose } = require("mongoose");

const BaseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    permissionLevel: {
      type: String,
      enum: ["none", "read", "comment", "edit", "create"],
      required: true,
    },
    _userIds: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
  },
  { strict: false },
);

exports.BaseSchema = mongoose.model("Base", BaseSchema, "airtable_bases");
