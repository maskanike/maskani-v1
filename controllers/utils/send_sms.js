const rp = require('request-promise');

const config = require(`../../config/${process.env.NODE_ENV}`); // TODO Find a better way to do this variable import

async function sendSMS(req, msisdn, message) {
  const messagePayload = `to=${msisdn}&message=${encodeURIComponent(message)}&username=${config.at_username}`;

  const options = {
    url: config.at_url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': `${config.at_apikey}`,
      'Accept': 'application/json',
    },
    body: messagePayload,
  };

  if (process.env.NODE_ENV === 'test') {
    return true
  }

  try {
    await rp(options);
    await req.context.models.Notification.create({
      message,
      destination: msisdn,
      type: 'sms',
      status: 'success',
    });
    return true

  } catch (e) {
    await req.context.models.Notification.create({
      message,
      destination: msisdn,
      type: 'sms',
      error: e,
      status: 'failed',
    });
  }
};

export default sendSMS;