const rp = require('request-promise');

const config = require(`../../config/${process.env.NODE_ENV}`); // TODO Find a better way to do this variable import

async function sendEmail(req, from, to, subject, html) {
  var mailgun = new Mailgun({apiKey: config.mailgun_api_key, domain: config.mailgun_domain});
  var data = {
    from,
    to,
    subject,
    html,
  }
  mailgun.messages().send(data, function (err, body) {
      //If there is an error, render the error page
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