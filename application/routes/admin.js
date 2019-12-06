var express = require('express');
var router = express.Router();

import models from '../models';
import auth from '../middlewares/auth';
import attachCurrentUser from '../middlewares/attachCurrentUser';

router.get('/', function (req, res) {
  res.send('Welcome to the Admin API');
});

// Flats CRUD REST API

router.get('/flat', auth, attachCurrentUser, async (req, res) => {
  const flats = await models.Flat.findAll({ where: { UserId: req.currentUser.id }});
  return res.send(flats);
});

router.post('/flat', auth, attachCurrentUser, async (req, res) => {
  const message = await models.Flat.create({
    name: req.body.name, paymentDetails: req.body.paymentDetails, UserId:req.currentUser.id
  });
  return res.send(message);
});

router.delete('/flat/:flatId', auth, attachCurrentUser, async (req, res) => {
  await models.Flat.destroy({
    where: {
      id: req.params.flatId
    }
  });
  return res.send(true);
});

router.put('/flat/:flatId', auth, attachCurrentUser, async (req, res) => {
  const message = await models.Flat.update(
    { name: req.body.name, paymentDetails: req.body.paymentDetails },
    { returning: true, where: { id: req.params.flatId } }
  );
  return res.send(message);
});


// Units CRUD REST API
router.get('/unit', auth, attachCurrentUser, async (req, res) => {
  // User has to be authenticated to check their units.
  const FlatId = req.query.flatId;
  if (!FlatId) {
    return res.send('Flat not specified. Add ?flatId=')
  }

  const units = await models.Unit.
    findAll({
      where: { FlatId },
      include: [
        {
          model: models.Tenant,
          include: [models.User, models.Invoice]
        }],
      order: [
        ['name', 'DESC'],
      ],
    });
  return res.send(units);
});

router.post('/unit', auth, attachCurrentUser, async (req, res) => {
  // TODO invalidate if flatId is not passed
  const message = await models.Unit.create({
    name: req.body.name, status: req.body.status, FlatId: req.body.FlatId
  });
  return res.status(201).send(message);
});

router.delete('/unit/:unitId', auth, attachCurrentUser, async (req, res) => {
  await models.Unit.destroy({
    where: {
      id: req.params.unitId
    }
  });
  return res.send(true);
});

router.put('/unit/:unitId', auth, attachCurrentUser, async (req, res) => {
  const message = await models.Unit.update(
    { name: req.body.name, status: req.body.status },
    { returning: true, where:{ id: req.params.unitId } }
  );
  return res.send(message);
});


module.exports = router;
