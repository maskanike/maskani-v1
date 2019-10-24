var express = require('express');
var router = express.Router();

import models from '../models';

import auth from '../middlewares/auth';
import attachCurrentUser from '../middlewares/attachCurrentUser';

// Tenant CRUD REST API
router.get('/', auth, attachCurrentUser, async (req, res) => {
  const user = req.currentUser;
  console.log('/tenant GET request made by user: ', user.name);

  const flatId = req.query.flatId;
  if (!flatId) {
    return res.send('Flat not specified. Add ?flatId=')
  }
  const tenants = await models.Tenant.findAll({ 
    where: { flatId },
    include: [ models.User,  models.Unit ],
  });
  return res.send(tenants);
});

router.post('/', auth, attachCurrentUser, async (req, res) => {
  const authUser = req.currentUser;
  console.log('/tenant POST  request made by user: ', authUser.name);

  const { name, email, msisdn, rent, garbage, penalty, water, unitId, flatId } = req.body;
  const user = await createUser(name, email, msisdn);
  const tenant = await createTenant(rent,garbage, water,penalty);

  await tenant.setUser(user.id);
  await tenant.setUnit(unitId);
  await tenant.setFlat(flatId);

  return res.send(tenant);
});

router.delete('/:tenantId', async (req, res) => {
  await models.Tenant.destroy({
    where: {
      id: req.params.tenantId
    }
  });
  return res.send(true);
});

router.put('/:tenantId', async (req, res) => {
  const message = await models.Tenant.update(
    {
      rent:    req.body.rent,
      deposit: req.body.deposit,
      balance: req.body.balance,
      flatId:  req.body.flatId,
      userId:  req.body.userId,
      unitId:  req.body.unitId,
    },
    { returning:true, where:{ id:req.params.tenantId }}
  );
  return res.send(message);
});

// Support UI edit interface
router.put('/ui/:tenantId', async (req, res) => {
  const { name, email, msisdn, rent, garbage, water, penalty, status, unitId, userId } = req.body;
  const tenantId = req.params.tenantId

  await models.Tenant.update(
    { rent, garbage, water, penalty, status },
    { returning:true, where:{ id: tenantId } }
  );

  await models.User.update(
    { name, email, msisdn },
    { returning:true, where:{ id: userId } }
  );
  
  if (status === 'left') {
    await makeUnitVacant(tenantId)
  }
  else if (status === 'changed') {
    await makeUnitVacant(tenantId);

    // Add user to new unit
    await addTenantToUnit(unitId, tenantId);
  }
  return res.json({ message: 'update successful' });
});

router.post('/ui/unit/assign', async (req, res) => {
  const { unitId, tenantId } = req.body;
  await addTenantToUnit(unitId, tenantId);
  
  return res.json({ message:`unit ${unitId} successful allocated to ${tenantId}` });
});


async function makeUnitVacant(tenantId) {
  await models.Unit.update(
    { tenantId: null },
    { returning: true, where: { tenantId }}
  );
  console.log(`Unit for tenant ${tenantId} made vacant`);
}

// TODO move this logic into controllers
async function addTenantToUnit(unitId, tenantId) {
  await models.Unit.update(
    { tenantId },
    { returning: true, where: { id:unitId }}
  );
  console.log(`Unit ${unitId} now occupied by tenant ${tenantId}`);
}

async function createUser(name, email, msisdn){
  return await models.User.create({ name, email, msisdn });
}

async function createTenant(rent, garbage, water, penalty) {
  return await models.Tenant.create({ balance:0, rent, garbage, water, penalty });
}

module.exports = router;
