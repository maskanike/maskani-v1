var Mailgun = require('mailgun-js');

const MAILGUN_APIKEY = process.env.MAILGUN_APIKEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

async function sendEmail(req, from, to, subject, html) {
  if (!MAILGUN_APIKEY || !MAILGUN_DOMAIN){
    console.log('MAILGUN APIKEY or DOMAIN missing from env variables. Please add them');
    return;
  }

  var mailgun = new Mailgun({ apiKey:MAILGUN_APIKEY, domain:MAILGUN_DOMAIN });
  var data = {
    from,
    to,
    subject,
    html,
  }
  mailgun.messages().send(data, async function (err, body) {
      if (err) {
        await req.context.models.Notification.create({
          message: html,
          destination: to,
          type: 'email',
          error: err,
          status: 'failed',
        });
        return false;
      }
      else {
        await req.context.models.Notification.create({
          message: html,
          destination: to,
          type: 'email',
          status: 'success',
        });
        return true;
      }
  });

  return true
};

export default sendEmail;