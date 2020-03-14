var Mailgun = require('mailgun-js');

import { EMAIL_HEADER, EMAIL_FOOTER } from './constants';
import models from '../../models';

const MAILGUN_APIKEY = process.env.MAILGUN_APIKEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

async function sendEmail(data) {
  if (!MAILGUN_APIKEY || !MAILGUN_DOMAIN) {
    console.log('MAILGUN APIKEY or DOMAIN missing from env variables. Please add them');
    return;
  }

  const { html, subject, to } = data;
  const mailgun = new Mailgun({ apiKey: MAILGUN_APIKEY, domain: MAILGUN_DOMAIN });
  const email = {
    from: `${data.name} <${data.from}>`,
    to,
    subject,
    html,
  }

  mailgun.messages().send(email, async function (err) {
    if (err) {
      await models.Notification.create({
        message: html,
        destination: to,
        type: 'email',
        error: err,
        status: 'failed',
      });
      console.error('Email sending failed: Subject: ', subject, ' to ', to);
    }
    else {
      await models.Notification.create({
        message: html,
        destination: to,
        type: 'email',
        status: 'success',
      });
      console.log('Email sent successfully: Subject', subject, ' to ', to);
    }
  });
};

function sendInvoiceEmail(emailContent) {
  const subject = `Your Invoice for ${emailContent.month} - ${emailContent.year} | ${emailContent.flat}`;

  const html = EMAIL_HEADER + 
    `<p style="margin-bottom: 25px;">Dear ${emailContent.name},</p>` +
    `<p style="margin-bottom: 25px;">Thank you for being a tenant at <b> ${emailContent.flat} </b> unit  <b> ${emailContent.unit}</b>. ` +
    `Your invoice for ${emailContent.month} ${emailContent.year} is ready.</p>` +
    `<p style="margin-bottom: 25px;">Please pay <b> ${emailContent.totalRent} KSHS</b> before 5th  ${emailContent.month} ${emailContent.year} .</p> ` +
    `<p style="margin-bottom: 25px;">Your rental breakdown is as follows:</p>` +
    `<ul class="list-group list-group-flush"></ul>` +
    `<li class="list-group-item">Rent Due: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.rent} </a></li>` +
    `<li class="list-group-item">Water Bill: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.water} </a></li>` +
    `<li class="list-group-item">Garbage: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.garbage} </a></li>` +
    `<li class="list-group-item">Penalty: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.penalty} </a></li>` +
    `</ul>` +
    `<br>` +
    `<p style="margin-top: 10px;">Sincerely,</p> ` +
    `<p style="margin-top: 2px;">The Maskani Team</p>` +
    EMAIL_FOOTER;

  sendEmail({subject, html, to: emailContent.to });
};

function sendReceiptEmail(emailContent) {
  const subject = `Your Receipt for ${emailContent.month} - ${emailContent.year} | ${emailContent.flat}`;

  const html = EMAIL_HEADER + 
  `<p style="margin-bottom: 25px;">Dear ${emailContent.name},</p>` +
  `<p style="margin-bottom: 25px;">Thank you for being a tenant at <b> ${emailContent.flat} </b> unit  <b> ${emailContent.unit}</b>. ` +
  `This is a payment receipt for payment made on <b>${emailContent.day} / ${emailContent.month} / ${emailContent.year}.<b>` +
  `<p style="margin-bottom: 25px;"></p>` +
  `<ul class="list-group list-group-flush"></ul>` +
  `<li class="list-group-item">Amount: <a style="color: #28AFB0; word-wrap: break-word;"> ${emailContent.amount} </a></li>` +
  `</ul>` +
  `<br>` +
  `<p style="margin-bottom: 15px;">Thank you for your continued support.</p>` +
  `<p style="margin-top: 10px;">Sincerely,</p> ` +
  `<p style="margin-top: 2px;">The Maskani Team</p>` +
  EMAIL_FOOTER;

  sendEmail({subject, html, to: emailContent.to });
};

export { sendInvoiceEmail, sendReceiptEmail };