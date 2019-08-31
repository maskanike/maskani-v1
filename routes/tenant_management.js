var express = require('express');
var router = express.Router();

// Tenant CRUD REST API

router.get('/', async (req, res) => {
  // User has to be authenticated to check their tenants.
  const flatId = req.query.flatId;
  if (!flatId) {
    return res.send('Flat not specified. Add ?flatId=')
  }
  const tenants = await req.context.models.Tenant.findAll({ where: { flatId }});
  return res.send(tenants);
});


router.post('/', async (req, res) => {
  const message = await req.context.models.Tenant.create({
    rent: req.body.rent,
    deposit: req.body.deposit,
    balance: req.body.balance,
    flatId: req.body.flatId,
    userId: req.body.userId,
    unitId: req.body.unitId,
  });
  return res.send(message);
});

router.delete('/:tenantId', async (req, res) => {
  await req.context.models.Tenant.destroy({
    where: {
      id: req.params.tenantId
    }
  });
  return res.send(true);
});

router.put('/:tenantId', async (req, res) => {
  const message = await req.context.models.Tenant.update(
    {
      rent: req.body.rent,
      deposit: req.body.deposit,
      balance: req.body.balance,
      flatId: req.body.flatId,
      userId: req.body.userId,
      unitId: req.body.unitId,
    },
    { returning:true, where:{ id:req.params.tenantId }}
  );
  return res.send(message);
});

module.exports = router;
