var express = require('express');
var router = express.Router();

import sendEmail from '../controllers/utils/send_email';
import sendSMS from '../controllers/utils/send_sms';
import sendSlackNotification from '../controllers/utils/slack_notify';
import models from '../models';

router.get('/', function (req, res) {
  res.send('Welcome to the Billing API');
});

router.post('/invoice', async (req, res) => {
  const { rent, water, penalty, garbage, tenantId } = req.body;
  try {
    const invoice = await models.Invoice.create({
      rent,
      water,
      penalty,
      garbage,
      TenantId:tenantId,
    });
    const totalRent = rent + water + penalty + garbage;

    await models.Statement.create({
      amount: totalRent,
      type: 'invoice',
      TenantId:tenantId,
      // TODO keep track of how much a tenant owes.
    });

    const date  = new Date();
    const month = date.toLocaleString('en-us', { month: 'short' }); // From: https://stackoverflow.com/a/18648314/1330916
    const year  = date.getFullYear();

    const tenant = await models.Tenant.findByPk(tenantId);
    const user   = await tenant.getUser();
    const flat   = await tenant.getFlat();
    const unit   = await tenant.getUnit();

    const flatUser = await models.User.findByPk(flat.UserId);

    const sms = `Hello ${user.name.split(' ')[0]}! This is an invoice for ${unit.name} at ${flat.name} for the period ${month} - ${year}.\nTOTAL: ${totalRent}\n` +
      `Sent to your email ${user.email}.`;
    sendSMS(req, user.msisdn, sms);

    if (!flatUser.email) {
      console.log(`User ${flatUser} does not have an email address. Skipping sending email address`)
    }
    const emailData = {
      to: user.email,
      from: flatUser.email,
      name: flatUser.name,
      flat: flat.name,
      unit: unit.name,
      month,
      year,
      totalRent,
      rent,
      water,
      penalty,
      garbage,
    }
    sendEmail(req, emailData);

    sendSlackNotification(
      '#invoices',
      `Invoice sent to ${user.name} for ${unit.name} at ${flat.name} for the period ${month} - ${year} of amount ${totalRent}`,
    );

    return res.send(invoice);

  } catch (error) {
    console.error('error happened: ', error);
    const env = process.env.NODE_ENV;
    if (env === 'production') {
      await sendSlackNotification('#production-errors', JSON.stringify(error));
    }
    else if (env === 'staging') {
      await sendSlackNotification('#staging-errors', JSON.stringify(error));
    }
  }
  return res.send('An error occurred');
});

module.exports = router;
