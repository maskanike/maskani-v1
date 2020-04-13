import { EMAIL_HEADER, EMAIL_FOOTER } from './constants';
import models from '../../models';
import logError from './error_notify';

const Mailgun = require('mailgun-js');

const { MAILGUN_APIKEY, MAILGUN_DOMAIN } = process.env;

async function sendEmail(data) {
  if (!MAILGUN_APIKEY || !MAILGUN_DOMAIN) {
    console.log('MAILGUN APIKEY or DOMAIN missing from env variables. Please add them');
    return;
  }

  const {
    html, subject, to, from,
  } = data;
  const mailgun = new Mailgun({ apiKey: MAILGUN_APIKEY, domain: MAILGUN_DOMAIN });
  const email = {
    from: `${data.name} <${from}>`,
    to,
    subject,
    html,
  };

  mailgun.messages().send(email, async (err) => {
    if (err) {
      await models.Notification.create({
        message: html,
        destination: to,
        type: 'email',
        error: err,
        status: 'failed',
      });
      logError(`Email sending failed: Subject: ${subject} to ${to}`);
    } else {
      await models.Notification.create({
        message: html,
        destination: to,
        type: 'email',
        status: 'success',
      });
      console.log('Email sent successfully: Subject: ', subject, ' to: ', to, ' from: ', from);
    }
  });
}

function sendInvoiceEmail(emailContent) {
  const subject = `Your Invoice for ${emailContent.month} - ${emailContent.year} | ${emailContent.flat}`;

  const html = `${EMAIL_HEADER
  }<p style="margin-bottom: 25px;">Dear ${emailContent.name},</p>`
    + `<p style="margin-bottom: 25px;">Thank you for being a tenant at <b> ${emailContent.flat} </b> unit  <b> ${emailContent.unit}</b>. `
    + `Your invoice for ${emailContent.month} ${emailContent.year} is ready.</p>`
    + `<p style="margin-bottom: 25px;">Please pay <b> ${emailContent.totalRent} KSHS</b> before 5th  ${emailContent.month} ${emailContent.year} .</p> `
    + '<p style="margin-bottom: 25px;">Your rental breakdown is as follows:</p>'
    + '<ul class="list-group list-group-flush"></ul>'
    + `<li class="list-group-item">Rent Due: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.rent} </a></li>`
    + `<li class="list-group-item">Water Bill: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.water} </a></li>`
    + `<li class="list-group-item">Garbage: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.garbage} </a></li>`
    + `<li class="list-group-item">Penalty: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.penalty} </a></li>`
    + '</ul>'
    + '<br>'
    + '<p style="margin-top: 10px;">Sincerely,</p> '
    + `<p style="margin-top: 2px;">The Maskani Team</p>${
      EMAIL_FOOTER}`;

  const { to, from, name } = emailContent;
  sendEmail({
    subject, html, to, from, name,
  });
}

function sendReceiptEmail(emailContent) {
  const subject = `Your Receipt for ${emailContent.month} - ${emailContent.year} | ${emailContent.flat}`;

  const html = `${EMAIL_HEADER
  }<p style="margin-bottom: 25px;">Dear ${emailContent.name},</p>`
  + `<p style="margin-bottom: 25px;">Thank you for being a tenant at <b> ${emailContent.flat} </b> unit  <b> ${emailContent.unit}</b>. `
  + `We have received your rental payment made on <b>${emailContent.day} / ${emailContent.month} / ${emailContent.year}.<b>`
  + '<p style="margin-bottom: 25px;"></p>'
  + '<ul class="list-group list-group-flush"></ul>'
  + `<li class="list-group-item">Amount: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.amount} </a></li>`
  + '</ul>'
  + '<br>'
  + '<p style="margin-bottom: 15px;">Thank you for your continued support.</p>'
  + '<p style="margin-top: 10px;">Sincerely,</p> '
  + `<p style="margin-top: 2px;">The Maskani Team</p>${
    EMAIL_FOOTER}`;

  const { to, from, name } = emailContent;
  sendEmail({
    subject, html, to, from, name,
  });
}

export { sendInvoiceEmail, sendReceiptEmail };
