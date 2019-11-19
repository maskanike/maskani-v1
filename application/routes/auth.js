const express = require('express');
const router = express.Router();

import Login from '../controllers/auth/login'
import Signup from '../controllers/auth/signup'
import models from '../models';

router.get('/', function(req, res) {
  res.send('Welcome to the Auth API');
});

router.post('/user', async (req, res) => {
  const message = await models.User.create({
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
  await models.User.destroy({
    where: {
      id: req.params.unitId
    }
  });
  return res.send(true);
});

router.put('/:userId', async (req, res) => {
  const message = await models.User.update(
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const response = await Login(email, password);
  if (response.error) {
    return res.status(400).send(response);
  }
  return res.status(200).send(response);
});

router.post('/signup', async (req, res) => {
  console.log('req.body: ', req.body);

  const { email, name, msisdn, password1, password2 } = req.body;
  const response = await Signup(email, name, msisdn, password1, password2);
  if (response.user) {
    return res.send(response);
  }
  return res.status(401).send(response); // TODO return proper status codes
});

module.exports = router;
