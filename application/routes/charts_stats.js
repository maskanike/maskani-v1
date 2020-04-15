import models from '../models';
import auth from '../middleware/auth';
import attachCurrentUser from '../middleware/attachCurrentUser';

const moment = require('moment');
const express = require('express');

const router = express.Router();

const { Op } = models.Sequelize;

async function getAmountInvoicedInPast12Months(UserId) {
  const now = moment().format();
  const startDate = moment().subtract(12, 'month').format();

  const invoices = await models.Invoice.findAll({
    where: { createdAt: { [Op.between]: [startDate, now] }, outdated: false },
    order: [['createdAt', 'ASC']],
    include: { model: models.Unit, include: { model: models.Flat, where: { UserId } } },
  });

  const labels = [];
  const data = [];
  const checkedMonths = [];

  invoices.forEach((invoice) => {
    const createdAt = moment(invoice.createdAt).format('YYYY-MM');
    const totalInvoicedAmount = (invoice.rent + invoice.water + invoice.garbage + invoice.penalty);
    if (checkedMonths.indexOf(createdAt) >= 0) {
      const index = checkedMonths.indexOf(createdAt);
      data[index] += totalInvoicedAmount;
    } else {
      checkedMonths.push(createdAt);
      data.push(totalInvoicedAmount);
      labels.push(createdAt);
    }
  });

  return { data, labels };
}

async function getOccupantsInFlat(units) {
  let occupants = 0;
  for (let index = 0; index < units.length; index++) { // eslint-disable-line no-plusplus
    const tenant = await units[index].getTenant(); // eslint-disable-line no-await-in-loop
    if (tenant) {
      occupants += 1;
    }
  }
  return occupants;
}

async function getThisMonthStats(UserId) {
  const thisMonth = moment().format('YYYY-MM');
  const monthStart = moment(thisMonth).format();
  const monthEnd = moment(thisMonth).add(1, 'month').format();

  const invoices = await models.Invoice.findAll({
    where: { createdAt: { [Op.between]: [monthStart, monthEnd] }, outdated: false },
    order: [['createdAt', 'ASC']],
    include: {
      model: models.Unit, include: { model: models.Flat, where: { UserId } },
    },
  });

  let totalInvoicedAmount = 0;
  if (invoices.length) {
    invoices.forEach(async (invoice) => {
      totalInvoicedAmount += (invoice.rent + invoice.water + invoice.garbage + invoice.penalty);
    });
  }

  // get occupancy rate
  const flats = await models.Flat.findAll({ where: { UserId } });

  let occupancy = 0;
  let units;
  let occupants;

  if (flats.length) {
    units = await flats[0].getUnits();
    if (units.length) {
      occupants = await getOccupantsInFlat(units);
      occupancy = Math.round((occupants / units.length) * 100);
    }
  }
  return {
    totalInvoicedAmount, occupancy, occupants, units: units.length,
  };
}

// Support UI charts
router.get('/stats/:user', auth, attachCurrentUser, async (req, res) => {
  // get amount invoiced in the past 12 months.
  // Get occupancy rate in the last 12 months.
  // Get water, rent, garbage and penalty income

  const UserId = req.params.user;// req.currentUser.id;
  const invoicedAmounts = await getAmountInvoicedInPast12Months(UserId);
  const monthStats = await getThisMonthStats(UserId);
  return res.json({ invoicedAmounts, monthStats });
});

module.exports = router;
