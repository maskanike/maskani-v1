var Mailgun = require('mailgun-js');

const config = require(`../../config/${process.env.NODE_ENV}`); // TODO Find a better way to do this variable import

async function sendEmail(req, from, to, subject, html) {
  var mailgun = new Mailgun({ apiKey:config.mailgun_apikey, domain:config.mailgun_domain });
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