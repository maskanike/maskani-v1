const express = require('express');
const router = express.Router();
const moment = require('moment');

import auth from '../middlewares/auth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import models from '../models';
import {sendInvoiceEmail, sendReceiptEmail } from '../controllers/utils/send_email';
import sendSMS from '../controllers/utils/send_sms';
import sendSlackNotification from '../controllers/utils/slack_notify';
const Op = models.Sequelize.Op;

router.get('/', function (req, res) {
  res.send('Welcome to the Billing API');
});

// TODO out in auth 'auth, attachCurrentUser;'
router.get('/invoice', async (req, res) => {
  const today = moment();
  const date = req.query.month || today.format('YYYY-MM');
  const initDate = moment(date).format();
  const endDate = moment(date).add(1, 'month').format();
  const FlatId = req.query.flatId;

  const invoices = await models.Invoice.findAll({
    where: {
      // FlatId, 
      createdAt: {
        [Op.between]: [initDate, endDate]
      }
    },
    include: [
      models.Unit,
      { model: models.Tenant, include: models.User }]
  });

  const units = await models.Unit.findAll({ where: { FlatId }});
  
  const resp = units.map((unit) => {
    const invoice = invoices.find(invoice => invoice.Unit.id === unit.id);
    if (invoice) {
      return invoice
    };
    return { invoice: null, UnitId: unit.id, Unit: unit };
  });
  return res.send(resp);
});


router.post('/invoice', auth, attachCurrentUser, async (req, res) => {
  const { rent, water, penalty, garbage, tenantId } = req.body;
  try {
    const tenant = await models.Tenant.findByPk(tenantId);
    const unit = await tenant.getUnit();
    const user = await tenant.getUser();
    const flat = await tenant.getFlat();

    const invoice = await models.Invoice.create({
      rent,
      water,
      penalty,
      garbage,
      TenantId: tenantId,
      UnitId: unit.id
    });
    const totalRent = rent + water + penalty + garbage;

    await models.Statement.create({
      amount: totalRent,
      type: 'invoice',
      TenantId: tenantId,
      // TODO keep track of how much a tenant owes.
    });

    const date = new Date();
    const month = date.toLocaleString('en-us', { month: 'short' }); // From: https://stackoverflow.com/a/18648314/1330916
    const year = date.getFullYear();

    const flatUser = await models.User.findByPk(flat.UserId);

    const sms = `Hello ${user.name.split(' ')[0]}! This is an invoice for ${unit.name} at ${flat.name} for the period ${month} - ${year}.\nTOTAL: ${totalRent}\n` +
      `Sent to your email ${user.email}.`;
    sendSMS(req, user.msisdn, sms);

    sendSlackNotification(
      '#invoices',
      `Invoice sent to ${user.name} for ${unit.name} at ${flat.name} for the period ${month} - ${year} of amount ${totalRent}`,
    );

    if (flatUser && flatUser.email) {
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
      sendInvoiceEmail(emailData);
    } else {
      console.log(`User ${flatUser} does not have an email address. Skipping sending email address`);
    }

    return res.status(201).send(invoice);

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
  return res.status(400).send(`An error occurred ${error}`);
});

router.get('/receipts', async (req, res) => {
  const today = moment();
  const date = req.query.month || today.format('YYYY-MM');
  const initDate = moment(date).format();
  const endDate = moment(date).add(1, 'month').format();
  const FlatId = req.query.flatId;

  const receipts = await models.Receipt.findAll({
    where: {
      createdAt: {
        [Op.between]: [initDate, endDate]
      }
    },
    include: [
      models.Unit,
      { model: models.Tenant, include: models.User }]
  });

  const units = await models.Unit.findAll({ where: { FlatId }});
  
  const resp = units.map((unit) => {
    const receipt = receipts.find(receipt => receipt.Unit.id === unit.id);
    if (receipt) {
      return receipt
    };
    return { receipt: null, UnitId: unit.id, Unit: unit };
  });
  return res.send(resp);
});

router.post('/receipts', auth, attachCurrentUser, async (req, res) => {
  const { amount, tenantId } = req.body;
  try {
    const tenant = await models.Tenant.findByPk(tenantId);
    const unit = await tenant.getUnit();
    const user = await tenant.getUser();
    const flat = await tenant.getFlat();

    const receipt = await models.Receipt.create({
      amount,
      TenantId: tenantId,
      UnitId: unit.id
    });

    await models.Statement.create({
      amount: amount,
      type: 'payment',
      TenantId: tenantId,
    });

    const date = new Date();
    const month = date.toLocaleString('en-us', { month: 'short' }); // From: https://stackoverflow.com/a/18648314/1330916
    const year = date.getFullYear();
    const day = date.getDate();

    const flatUser = await models.User.findByPk(flat.UserId);

    const sms = `Hello ${user.name.split(' ')[0]}! This is to confirm we received ${amount} Kshs for ${unit.name} at ${flat.name}.\n` +
      `Sent to your email ${user.email}.`;
    sendSMS(req, user.msisdn, sms);

    sendSlackNotification(
      '#receipts',
      `Receipt sent to ${user.name} for ${unit.name} at ${flat.name} for the period ${month} - ${year} of amount ${amount}`,
    );

    if (flatUser && flatUser.email) {
      const emailData = {
        to: user.email,
        from: flatUser.email,
        name: flatUser.name,
        flat: flat.name,
        unit: unit.name,
        day,
        month,
        year,
        amount,
      }
      sendEmail(emailData);
    } else {
      console.log(`User ${flatUser} does not have an email address. Skipping sending email address`);
    }

    return res.status(201).send(receipt);

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
  return res.status(400).send(`An error occurred ${error}`);
});

module.exports = router;
