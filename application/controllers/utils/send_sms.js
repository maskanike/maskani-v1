const rp = require('request-promise');
import models from '../../models';

const AT_USERNAME = process.env.AT_USERNAME;
const AT_APIKEY = process.env.AT_APIKEY;

async function sendSMS(req, msisdn, message) {
  if (!AT_APIKEY || !AT_USERNAME) {
    console.log('Africastaking APIKEY or USERNAME missing from env variables. Please add them');
    return;
  }
  const messagePayload = `to=${msisdn}&message=${encodeURIComponent(message)}&username=${AT_USERNAME}`;

  const options = {
    url: "https://api.africastalking.com/version1/messaging",
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': AT_APIKEY,
      'Accept': 'application/json',
    },
    body: messagePayload,
  };

  if (process.env.NODE_ENV === 'test') {
    return
  }

  try {
    await rp(options);
    await models.Notification.create({
      message,
      destination: msisdn,
      type: 'sms',
      status: 'success',
    });
    
    console.log('SMS sent successfully: ', message, ' to ', msisdn);

  } catch (e) {
    await models.Notification.create({
      message,
      destination: msisdn,
      type: 'sms',
      error: e,
      status: 'failed',
    });
    console.error('SMS sending failed: ', message, ' to ', msisdn);
  }
};

export default sendSMS;