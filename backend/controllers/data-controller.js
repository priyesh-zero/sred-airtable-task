const { BaseSchema } = require("../models/airtable/project");
const { TableSchema } = require("../models/airtable/table");
const { TicketSchema } = require("../models/airtable/ticket");
const Revision = require("../models/airtable/revision");
const { UserSchema } = require("../models/airtable/user");

const ModelMap = {
  Projects: BaseSchema,
  Tables: TableSchema,
  Tickets: TicketSchema,
  RevisionHistory: Revision,
  Users: UserSchema,
};

exports.getCollectionData = async (req, res) => {
  const { collection, page = 1, limit = 20, searchText = "" } = req.query;

  try {
    const Model = ModelMap[collection];
    if (!Model) return res.status(400).json({ error: "Invalid collection" });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const excludedFields = ["_id", "_userIds", "__v"];

    // Get only string fields from the schema for $regex filtering
    const stringFields = Object.entries(Model.schema.paths)
      .filter(
        ([key, type]) =>
          type.instance === "String" && !excludedFields.includes(key)
      )
      .map(([key]) => key);

    const query = {};

    if (searchText) {
      if (stringFields.length === 0) {
        return res.json({ fields: [], data: [], total: 0 });
      }

      query.$or = stringFields.map((field) => ({
        [field]: { $regex: searchText, $options: "i" },
      }));
    }

    // Perform query
    const docs = await Model.find(query).skip(skip).limit(limitVal).lean();
    const total = await Model.countDocuments(query);

    // Remove unwanted fields
    const data = docs.map((doc) => {
      excludedFields.forEach((field) => delete doc[field]);
      return doc;
    });

    // Return only visible fields
    const fields = data.length ? Object.keys(data[0]) : [];

    res.json({ fields, data, total });
  } catch (err) {
    console.error("getCollectionData Error:", err);
    res.status(500).json({ error: err.message });
  }
};
