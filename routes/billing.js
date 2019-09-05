var express = require('express');
var router = express.Router();

import sendEmail from '../controllers/utils/send_email';
import sendSMS from '../controllers/utils/send_sms';

router.get('/', function (req, res, next) {
  res.send('Welcome to the Billing API');
});

router.post('/invoice', async (req, res) => {
  const { rent, water, penalty, tenantId } = req.body;

  try {
    const invoice = await req.context.models.Invoice.create({
      rent,
      water,
      penalty,
      tenantId,
    });
    const totalBill = rent + water + penalty;
    await req.context.models.Statement.create({
      amount: totalBill,
      type: 'invoice',
      tenantId,
      // TODO keep track of how much a tenant owes.
    });
    const message = `Your bill for the month Feb is 10 bob`
    const tenant = await req.context.models.Tenant.findByPk(tenantId);
    const user = await tenant.getUser()
    const flat = await tenant.getFlat()
    
    const flatUser = await req.context.models.User.findByPk(flat.userId);

    await sendEmail(req, flatUser.email, user.email, 'Your Invoice this Month | Maskani', message)
    await sendSMS(req, user.msisdn, message)

    return res.send(invoice);
  } catch (error) {
    console.log('error happened: ', error);
  }
  return res.send('An error occurred');
});

module.exports = router;
