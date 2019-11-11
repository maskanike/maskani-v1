var Mailgun = require('mailgun-js');

import { EMAIL_HEADER, EMAIL_FOOTER } from './constants';

const MAILGUN_APIKEY = process.env.MAILGUN_APIKEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

async function sendEmail(req, data) {
  if (!MAILGUN_APIKEY || !MAILGUN_DOMAIN) {
    console.log('MAILGUN APIKEY or DOMAIN missing from env variables. Please add them');
    return;
  }

  const subject = `Your Invoice for ${data.month} - ${data.year} | ${data.flat}`;

  const html = EMAIL_HEADER + // TODO change header to refer to maskani and not flatspad logos
    `<p style="margin-bottom: 25px;">Dear ${data.name},</p>` +
    `<p style="margin-bottom: 25px;">Thank you for being a tenant at <b> ${data.flat} </b> unit  <b> ${data.unit}</b>. ` +
    `Your invoice for ${data.month} ${data.year} is ready.</p>` +
    `<p style="margin-bottom: 25px;">Please pay <b> ${data.totalRent} KSHS</b> before 5th of ${data.month} ${data.year} .</p> ` +
    `<p style="margin-bottom: 25px;">Your rental breakdown is as follows:</p>` +
    `<ul class="list-group list-group-flush"></ul>` +
    `<li class="list-group-item">Rent Due: <a style="color: #28AFB0; word-wrap: break-word;"> ${data.rent} </a></li>` +
    `<li class="list-group-item">Water Bill: <a style="color: #28AFB0; word-wrap: break-word;"> ${data.water} </a></li>` +
    `<li class="list-group-item">Garbage: <a style="color: #28AFB0; word-wrap: break-word;"> ${data.garbage} </a></li>` +
    `<li class="list-group-item">Penalty: <a style="color: #28AFB0; word-wrap: break-word;"> ${data.penalty} </a></li>` +
    `</ul>` +
    `<br>` +
    `<p style="margin-top: 10px;">Sincerely,</p> ` +
    `<p style="margin-top: 2px;">The Maskani Team</p>` +
    EMAIL_FOOTER;

  const mailgun = new Mailgun({ apiKey: MAILGUN_APIKEY, domain: MAILGUN_DOMAIN }); // TODO create new domain for maskani. Send emails from info@maskani.co.ke
  const email = {
    from: `${data.name} <${data.from}>`,
    to: data.to,
    subject,
    html,
  }

  mailgun.messages().send(email, async function (err) {
    if (err) {
      await req.context.models.Notification.create({
        message: html,
        destination: data.to,
        type: 'email',
        error: err,
        status: 'failed',
      });
      console.error('Email sending failed: Subject: ', subject, ' to ', data.to);
    }
    else {
      await req.context.models.Notification.create({
        message: html,
        destination: data.to,
        type: 'email',
        status: 'success',
      });
      console.log('Email sent successfully: Subject', subject, ' to ', data.to);
    }
  });
};

export default sendEmail;