var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Welcome to the Admin API');
});

router.get('/flat', async (req, res) => {
  const flats = await req.context.models.Flat.findAll();
  return res.send(flats);
});

router.post('/flat', async (req, res) => {
  const message = await req.context.models.Flat.create({
    name: req.body.name, paymentDetails: req.body.paymentDetails
  });
  return res.send(message);
});

router.delete('/flat/:flatId', async (req, res) => {
  await req.context.models.Flat.destroy({
    where: {
      id: req.params.flatId
    }
  });
  return res.send(true);
});

router.put('/flat/:flatId', async (req, res) => {
  res.send(`Welcome to the Admin API. Match to controllers/admin/flat/update for flat ${req.params.flatId}`);
});

module.exports = router;
