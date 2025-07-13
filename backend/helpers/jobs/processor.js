const { BaseSchema } = require("../../models/airtable/project");
const { TableSchema } = require("../../models/airtable/table");
const { TicketSchema } = require("../../models/airtable/ticket");
const { UserSchema } = require("../../models/airtable/user");
const AirtableAuth = require("../../models/AirtableAuth");
const {
  checkForUserBrowserInstance,
  checkForUserPageInstance,
  scrapeTicket,
} = require("../puppeteer");
const jobHandler = require("./handlers");
const { airtableRequest } = require("./request");

const getUser = async (userId) => {
  return AirtableAuth.findById(userId);
};

exports.syncProjects = async (job) => {
  const user = await getUser(job.userId);

  const { bases: projects, offset } = await airtableRequest(
    user,
    job.data.offset
      ? `/meta/bases?offset=${job.data.offset}`
      : "/v0/meta/bases",
  );

  const results = [];

  for (const project of projects) {
    const projectEntry = await BaseSchema.findOneAndUpdate(
      { id: project.id },
      {
        $addToSet: { _userIds: job.userId },
        $setOnInsert: {
          ...project,
        },
      },
      { upsert: true, new: true },
    );

    results.push(projectEntry);

    await jobHandler.add(
      "sync-tables",
      job.userId,
      { baseId: projectEntry.id },
      { priority: 2 },
    );
  }

  if (offset) {
    await jobHandler.add(
      "sync-projects",
      job.userId,
      { offset },
      { priority: 1 },
    );
  }

  return { synced: results.length, projects: results, offset };
};

exports.syncUsers = async (job) => {
  const user = await getUser(job.userId);

  const { Resources, startIndex, totalResults } = await airtableRequest(
    user,
    `/scim/v2/Users?startIndex=${job.data.startIndex || 1}`,
  );

  const results = [];

  for (const user of Resources) {
    const userEntry = await UserSchema.findOneAndUpdate(
      {
        id: user.id,
      },
      {
        $addToSet: { _userIds: job.userId },
        $setOnInsert: {
          ...user,
        },
      },
      { upsert: true, new: true },
    );

    results.push(userEntry);
  }

  if (startIndex + Resources.length < totalResults) {
    await jobHandler.add(
      "sync-users",
      job.userId,
      { startIndex },
      { priority: 1 },
    );
  }

  return { synced: results.length, users: results };
};

// Sync repositories
exports.syncTables = async (job) => {
  const user = await getUser(job.userId);

  const { tables } = await airtableRequest(
    user,
    `/v0/meta/bases/${job.data.baseId}/tables`,
  );

  const results = [];

  for (const table of tables) {
    const tableEntry = await TableSchema.findOneAndUpdate(
      {
        id: table.id,
      },
      {
        $addToSet: { _userIds: job.userId },
        $setOnInsert: {
          ...table,
        },
      },
      { upsert: true, new: true },
    );

    await jobHandler.add(
      "sync-tickets",
      job.userId,
      { baseId: job.data.baseId, tableId: table.id },
      { priority: 3 },
    );

    results.push(tableEntry);
  }

  return { synced: results.length, tables: results };
};

exports.syncTickets = async (job) => {
  const user = await getUser(job.userId);

  const timezone = "Asia/Kolkata";

  const endpoint = job.data.offset
    ? `/v0/${job.data.baseId}/${job.data.tableId}?timeZone=${timezone}&offset=${job.data.offset}`
    : `/v0/${job.data.baseId}/${job.data.tableId}?timeZone=${timezone}`;

  const { offset, records } = await airtableRequest(user, endpoint);

  const results = [];

  for (const ticket of records) {
    const tableEntry = await TicketSchema.findOneAndUpdate(
      {
        id: ticket.id,
      },
      {
        $addToSet: { _userIds: job.userId },
        $setOnInsert: {
          ...ticket,
        },
      },
      { upsert: true, new: true },
    );

    await jobHandler.add(
      "sync-revisions",
      job.userId,
      { baseId: job.data.baseId, ticketId: ticket.id },
      { priority: 3 },
    );

    results.push(tableEntry);
  }

  if (offset) {
    await jobHandler.add(
      "sync-tickets",
      job.userId,
      { baseId: job.data.baseId, tableId: job.data.tableId, offset },
      { priority: 3 },
    );
  }

  return {
    synced: results.length,
    tickets: results,
    offset,
  };
};

exports.syncRevisions = async (job) => {
  const data = await scrapeTicket(job);
  console.log(data);
};
