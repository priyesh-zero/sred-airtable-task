const Airtable = require("airtable");
const jobProcessor = require("./processor");

// Execute job based on type
exports.executeJob = async (job) => {
  switch (job.type) {
    case "sync-projects":
      return await jobProcessor.syncProjects(job);
    case "sync-tables":
      return await jobProcessor.syncTables(job);
    case "sync-tickets":
      return await jobProcessor.syncTickets(job);
    case "sync-users":
      return await jobProcessor.syncUsers(job);
    case "sync-revisions":
      return await jobProcessor.syncRevisions(job);
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
};
