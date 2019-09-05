const rp = require('request-promise');

const AT_USERNAME = process.env.AT_USERNAME;
const AT_APIKEY = process.env.AT_APIKEY;

async function sendSMS(req, msisdn, message) {
  if (!AT_APIKEY || !AT_USERNAME){
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
    await req.context.models.Notification.create({
      message,
      destination: msisdn,
      type: 'sms',
      status: 'success',
    });

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