var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('Welcome to the Auth API');
});

router.post('/user', async (req, res) => {
  const message = await req.context.models.User.create({
    email:    req.body.email,
    msisdn:   req.body.msisdn,
    password: req.body.password,
    name:     req.body.name,
    status:   'pending',
    role:     req.body.role,
  });
  return res.send(message);
});

router.delete('/:userId', async (req, res) => {
  await req.context.models.User.destroy({
    where: {
      id: req.params.unitId
    }
  });
  return res.send(true);
});

router.put('/:userId', async (req, res) => {
  const message = await req.context.models.User.update(
    {
      email:    req.body.email,
      msisdn:   req.body.msisdn,
      password: req.body.password,
      name:     req.body.name,
      status:   req.body.status,
      role:     req.body.role,
    },
    { returning:true, where:{ id:req.params.userId }}
  );
  return res.send(message);
});

module.exports = router;
