const User = require("../../models/AirtableAuth");
const axios = require("axios");

// Make GitHub API request with rate limiting
exports.airtableRequest = async (user, url, options = {}) => {
  const response = await axios.get(`https://api.airtable.com${url}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
      ...options.headers,
    },
    ...options,
  });

  return response.data;
};
