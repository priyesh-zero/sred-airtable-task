const axios = require('axios');
const cheerio = require('cheerio');

function generateRequestId() {
  return 'req' + Math.random().toString(36).substring(2, 12);
}

async function fetchRevisionHistory(ticketId, cookieHeader, secretSocketId) {
  const url = `https://airtable.com/v0.3/row/${ticketId}/readRowActivitiesAndComments`;

  const params = {
    stringifiedObjectParams: JSON.stringify({
      limit: 10,
      offsetV2: null,
      shouldReturnDeserializedActivityItems: true,
      shouldIncludeRowActivityOrCommentUserObjById: true
    }),
    requestId: generateRequestId(),
    secretSocketId
  };

  try {
    const res = await axios.get(url, {
      headers: {
        'Cookie': cookieHeader,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Time-Zone': 'Asia/Kolkata',
        'x-airtable-application-id': 'appitKP5uyJ0WPn13'  // hardcoded baseId
      },
      params
    });

    return res.data;
  } catch (error) {
    console.error('[fetchRevisionHTMLWithParams] Error fetching revision data:');
    console.error('URL:', url);
    console.error('ticketId:', ticketId);
    console.error('secretSocketId:', secretSocketId);
    console.error('Cookies:', cookieHeader);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error; // rethrow to let controller handle
  }
}

function parseActivityHtmlList(data, ticketId) {
  const results = [];

  for (const activityId of data.orderedActivityAndCommentIds) {
    const activity = data.rowActivityInfoById?.[activityId];
    if (!activity || !activity.diffRowHtml) continue;

    const $ = cheerio.load(activity.diffRowHtml);

    const columnName = $('.historicalCellContainer > div[columnid]').text().trim();
    const columnType = $('.historicalCellValue').data('columntype') || '';

    let oldValue = null;
    let newValue = null;

    const tokens = $('.cellToken');

    tokens.each((_, token) => {
      const $token = $(token);
      const title = $token.find('[title]').attr('title') || $token.text().trim();
      const style = $token.attr('style') || '';

      if (style.includes('line-through')) {
        oldValue = title;
      } else {
        newValue = title;
      }
    });

    // fallback if no cellToken found (e.g., for foreign keys, text, etc.)
    if (tokens.length === 0) {
      const rawText = $('.historicalCellValueContainer').text().trim();
      newValue = rawText;
    }

    results.push({
      uuid: activityId,
      issueId: ticketId,
      columnType,
      columnName,
      oldValue,
      newValue,
      createdDate: new Date(activity.createdTime),
      authoredBy: activity.originatingUserId
    });
  }

  return results;
}


module.exports = {
  fetchRevisionHistory,
  parseActivityHtmlList
};
