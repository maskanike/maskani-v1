import models from '../models';
import auth from '../middlewares/auth';
import attachCurrentUser from '../middlewares/attachCurrentUser';

const express = require('express');

const router = express.Router();

async function makeUnitVacant(TenantId) {
  await models.Unit.update(
    { TenantId: null },
    { returning: true, where: { TenantId } },
  );
  console.log(`Unit for tenant ${TenantId} made vacant`);
}

// TODO move this logic into controllers
async function addTenantToUnit(unitId, TenantId) {
  await models.Unit.update(
    { TenantId },
    { returning: true, where: { id: unitId } },
  );
  console.log(`Unit ${unitId} now occupied by tenant ${TenantId}`);
}

async function createUser(name, email, msisdn) {
  return models.User.create({ name, email, msisdn });
}

async function createTenant(rent, garbage, water, penalty) {
  return models.Tenant.create({
    balance: 0, rent, garbage, water, penalty,
  });
}

// Tenant CRUD REST API
router.get('/', auth, attachCurrentUser, async (req, res) => {
  const user = req.currentUser;
  console.log('/tenant GET request made by user: ', user.name);

  const FlatId = req.query.flatId;
  if (!FlatId) {
    return res.status(400).send('Flat not specified. Add ?flatId=');
  }
  const tenants = await models.Tenant.findAll({
    where: { FlatId },
    include: [models.User, models.Unit],
  });
  return res.send(tenants);
});

router.post('/', auth, attachCurrentUser, async (req, res) => {
  console.log('/tenant POST  request made by user: ', req.currentUser.name);

  const {
    name, email, msisdn, rent, garbage, penalty, water, unitId, flatId,
  } = req.body;
  try {
    const user = await createUser(name, email, msisdn);
    const tenant = await createTenant(rent, garbage, water, penalty);

    await tenant.setUser(user.id);
    await tenant.setUnit(unitId);
    await tenant.setFlat(flatId);

    return res.status(201).send(tenant);
  } catch (error) {
    console.log('Error when creating new tenant: ', error);
    return res.status(400).send(error);
  }
});

router.delete('/:tenantId', auth, attachCurrentUser, async (req, res) => {
  console.log('/tenant DELETE  request made by user: ', req.currentUser.name);
  await models.Tenant.destroy({
    where: {
      id: req.params.tenantId,
    },
  });
  return res.send(true);
});

router.put('/:tenantId', auth, attachCurrentUser, async (req, res) => {
  console.log('/tenant PUT  request made by user: ', req.currentUser.name);

  const message = await models.Tenant.update(
    {
      rent: req.body.rent,
      deposit: req.body.deposit,
      balance: req.body.balance,
      FlatId: req.body.flatId,
      UserId: req.body.userId,
      UnitId: req.body.unitId,
    },
    { returning: true, where: { id: req.params.tenantId } },
  );
  return res.send(message);
});

// Support UI edit interface
router.put('/ui/:tenantId', async (req, res) => {
  const {
    name, email, msisdn, rent, garbage, water, penalty, status, unitId, userId,
  } = req.body;
  const { tenantId } = req.params;

  await models.Tenant.update(
    {
      rent, garbage, water, penalty, status,
    },
    { returning: true, where: { id: tenantId } },
  );

  await models.User.update(
    { name, email, msisdn },
    { returning: true, where: { id: userId } },
  );

  if (status === 'left') {
    await makeUnitVacant(tenantId);
  } else if (status === 'changed') {
    await makeUnitVacant(tenantId);

    // Add user to new unit
    await addTenantToUnit(unitId, tenantId);
  }
  return res.json({ message: 'update successful' });
});

router.post('/ui/unit/assign', async (req, res) => {
  const { unitId, tenantId } = req.body;
  await addTenantToUnit(unitId, tenantId);

  return res.json({ message: `unit ${unitId} successful allocated to ${tenantId}` });
});

module.exports = router;
