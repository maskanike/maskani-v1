const models = require('../models');

const {
  Tenant, User, Flat, Unit
} = models;

async function aTenantExistsWith(props) {
  return await Tenant.create(props);
}

async function aFlatExistsWith(props) {
  return await Flat.create(props);
}

async function aUnitExistsWith(props) {
  return await Unit.create(props);
}

async function aUserExistsWith(props) {
  return await User.create(props);
}

async function truncateModel(model) {
  await models[model].destroy({ where: {} });
}

async function findUserByAPIKey(apikey) {
  const resp = await User.findOne({ where: { apikey } });
  return resp;
}

async function findByID(model, id) {
  const resp = await models[model].findByPk(id);
  return resp;
}

async function getAllFromModel(model) {
  const resp = await models[model].findAll();
  return resp;
}

async function deleteDatabaseEntryWithId(model, id) {
  await models[model].destroy({ where: { id } });
}

export {
  aTenantExistsWith,
  aFlatExistsWith,
  aUnitExistsWith,
  aUserExistsWith,
  deleteDatabaseEntryWithId,
  findByID,
  findUserByAPIKey,
  getAllFromModel,
  truncateModel,
};
