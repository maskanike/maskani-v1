var express = require('express');
var router = express.Router();

import auth from '../middlewares/auth';
import attachCurrentUser from '../middlewares/attachCurrentUser';

router.get('/', function (req, res) {
  res.send('Welcome to the Admin API');
});

// Flats CRUD REST API

router.get('/flat', auth, attachCurrentUser, async (req, res) => {
  const flats = await req.context.models.Flat.findAll({ where: { userId: req.currentUser.id }});
  return res.send(flats);
});

router.post('/flat', auth, attachCurrentUser, async (req, res) => {
  const message = await req.context.models.Flat.create({
    name: req.body.name, paymentDetails: req.body.paymentDetails, userId:req.currentUser.id
  });
  return res.send(message);
});

router.delete('/flat/:flatId', auth, attachCurrentUser, async (req, res) => {
  await req.context.models.Flat.destroy({
    where: {
      id: req.params.flatId
    }
  });
  return res.send(true);
});

router.put('/flat/:flatId', auth, attachCurrentUser, async (req, res) => {
  const message = await req.context.models.Flat.update(
    { name: req.body.name, paymentDetails: req.body.paymentDetails },
    { returning: true, where: { id: req.params.flatId } }
  );
  return res.send(message);
});


// Units CRUD REST API

router.get('/unit', auth, attachCurrentUser, async (req, res) => {
  // User has to be authenticated to check their units.
  const flatId = req.query.flatId;
  if (!flatId) {
    return res.send('Flat not specified. Add ?flatId=')
  }

  const units = await req.context.models.Unit.
    findAll({
      where: { flatId },
      include: [
        {
          model: req.context.models.Tenant,
          include: [req.context.models.User, req.context.models.Invoice]
        }],
      order: [
        ['name', 'DESC'],
      ],
    });
  return res.send(units);
});

router.post('/unit', auth, attachCurrentUser, async (req, res) => {
  // TODO invalidate of flatId is not passed
  const message = await req.context.models.Unit.create({
    name: req.body.name, status: req.body.status, flatId: req.body.flatId
  });
  return res.send(message);
});

router.delete('/unit/:unitId', auth, attachCurrentUser, async (req, res) => {
  await req.context.models.Unit.destroy({
    where: {
      id: req.params.unitId
    }
  });
  return res.send(true);
});

router.put('/unit/:unitId', auth, attachCurrentUser, async (req, res) => {
  const message = await req.context.models.Unit.update(
    { name: req.body.name, status: req.body.status },
    { returning: true, where:{ id: req.params.unitId } }
  );
  return res.send(message);
});


module.exports = router;
