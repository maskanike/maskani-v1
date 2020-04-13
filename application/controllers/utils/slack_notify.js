const rp = require('request-promise');

const channels = {
  '#invoices': 'SLACK_NOTIFY_URL_INVOICES',
  '#receipts': 'SLACK_NOTIFY_URL_RECEIPTS',
  '#staging-errors': 'SLACK_NOTIFY_URL_STAGING_ERRORS',
  '#production-errors': 'SLACK_NOTIFY_URL_PROD_ERRORS',
};

async function sendSlackNotification(channel, message) {
  if (process.env.NODE_ENV === 'test') {
    console.log('In test env. Ignore slack notification');
    return;
  }

  const channelUri = channels[channel];
  if (!channelUri) {
    console.error('slack channel not configured');
    return;
  }
  const uri = process.env[channelUri];
  const options = {
    uri,
    method: 'POST',
    json: true,
    body: {
      text: message,
    },
  };
  await rp(options);
}

module.exports = sendSlackNotification;
