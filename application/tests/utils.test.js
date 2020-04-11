const models = require('../models');

const {
  Tenant, User, Flat, Unit, Invoice, Receipt, Statement,
} = models;

async function aTenantExistsWith(props) {
  return Tenant.create(props);
}

async function aFlatExistsWith(props) {
  return Flat.create(props);
}

async function aUnitExistsWith(props) {
  return Unit.create(props);
}

async function aUserExistsWith(props) {
  return User.create(props);
}

async function anInvoiceExistsWith(props) {
  return Invoice.create(props);
}

async function aReceiptExistsWith(props) {
  return Receipt.create(props);
}

async function aStatementExistsWith(props) {
  return Statement.create(props);
}

async function truncateModel(model) {
  models[model].destroy({ where: {} });
}

async function findUserByAPIKey(apikey) {
  const resp = User.findOne({ where: { apikey } });
  return resp;
}

async function findByID(model, id) {
  const resp = models[model].findByPk(id);
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
  anInvoiceExistsWith,
  aReceiptExistsWith,
  aStatementExistsWith,
  deleteDatabaseEntryWithId,
  findByID,
  findUserByAPIKey,
  getAllFromModel,
  truncateModel,
};
