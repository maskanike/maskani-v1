var express = require('express');
var router = express.Router();

import sendEmail from '../controllers/utils/send_email';
import sendSMS from '../controllers/utils/send_sms';
import sendSlackNotification from '../controllers/utils/slack_notify';

router.get('/', function (req, res, next) {
  res.send('Welcome to the Billing API');
});

router.post('/invoice', async (req, res) => {
  const { rent, water, penalty, garbage, tenantId } = req.body;
  try {
    const invoice = await req.context.models.Invoice.create({
      rent,
      water,
      penalty,
      garbage,
      tenantId,
    });
    const totalRent = rent + water + penalty + garbage;

    await req.context.models.Statement.create({
      amount: totalRent,
      type: 'invoice',
      tenantId,
      // TODO keep track of how much a tenant owes.
    });

    const date  = new Date();
    const month = date.toLocaleString('en-us', { month: 'short' }); // From: https://stackoverflow.com/a/18648314/1330916
    const year  = date.getFullYear();

    const tenant = await req.context.models.Tenant.findByPk(tenantId);
    const user   = await tenant.getUser();
    const flat   = await tenant.getFlat();
    const unit   = await tenant.getUnit();

    const flatUser = await req.context.models.User.findByPk(flat.userId);

    const sms = `Hello ${user.name.split(' ')[0]}! This is an invoice for ${unit.name} at ${flat.name} for the period ${month} - ${year}.\nTOTAL: ${totalRent}\n` +
      `Sent to your email ${user.email}.`;
    sendSMS(req, user.msisdn, sms);

    // TODO do not attempt to send an email if the user does not have an email address.
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
