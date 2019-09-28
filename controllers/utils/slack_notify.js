const rp = require('request-promise');

const channels = {
  '#invoices':          'SLACK_NOTIFY_URL_INVOICES',
  '#receipts':          'SLACK_NOTIFY_URL_RECEIPTS',
  '#staging-errors':    'SLACK_NOTIFY_URL_STAGING_ERRORS',
  '#production-errors': 'SLACK_NOTIFY_URL_PRODUCTION_ERRORS',
};

async function sendSlackNotification(channel, message) {
  if (process.env.NODE_ENV === 'test') {
    console.log('In test env. Ignore slack notification')
  }
  console.log

  const channelUri = channels[channel];
  if (!channelUri) {
    console.error('channel not configured');
    return;
  }
  console.log('process.env: ', process.env[channelUri], ' channelUri: ', channelUri);
  const uri = process.env[channelUri];
  const options = {
    uri,
    method: 'POST',
    json: true,
    body: {
      'text': message,
    },
  };
  await rp(options);
};

module.exports = sendSlackNotification;