const rp = require('request-promise');

const channels = {
  '#invoices': 'SLACK_NOTIFY_URL_INVOICES',
  '#receipts': 'SLACK_NOTIFY_URL_RECEIPTS',
  '#production-errors': 'SLACK_NOTIFY_URL_PRODUCTION_ERRORS',
  '#staging-errors': 'SLACK_NOTIFY_URL_STAGING_ERRORS',
};

module.exports = {
  inputs: {
    message: { type:'string', required:true },
    channelName: { type:'string' }
  },
  fn: async function (inputs, exits) {
    if (process.env.NODE_ENV === 'test') {
      return exits.success('In test env. Ignore slack notification');
    }
    const message = inputs.message;
    const channelName = inputs.channelName;

    const channelUri = channels[channelName];
    if (!channelUri) {
      return exits.success('channel not configured');
    }
    const uri = process.env[channelUri];
    const options = {
      uri,
      method: 'POST',
      json: true,
      body: {
        'text':message,
      },
    };
    await rp(options);

    return exits.success();
  }
};
