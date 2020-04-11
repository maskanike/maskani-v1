import models from '../../models';

const moment = require('moment');

const { Op } = models.Sequelize;

async function outdateInvoiceEntry(tenant, monthStart, monthEnd) {
  const invoices = await models.Invoice.findAll({
    where: {
      TenantId: tenant,
      outdated: false,
      createdAt: {
        [Op.between]: [monthStart, monthEnd],
      },
    },
  });

  if (invoices.length) {
    invoices.forEach(async (invoice) => {
      const inv = await models.Invoice.findByPk(invoice.id);
      inv.outdated = true;
      await inv.save();
    });
  }
}

async function outdateReceiptEntry(tenant, monthStart, monthEnd) {
  const receipts = await models.Receipt.findAll({
    where: {
      TenantId: tenant,
      outdated: false,
      createdAt: {
        [Op.between]: [monthStart, monthEnd],
      },
    },
  });

  if (receipts.length) {
    receipts.forEach(async (receipt) => {
      const recpt = await models.Receipt.findByPk(receipt.id);
      recpt.outdated = true;
      await recpt.save();
    });
  }
}

async function outdateStatementEntry(tenant, monthStart, monthEnd, type) {
  const statements = await models.Statement.findAll({
    where: {
      TenantId: tenant,
      type,
      outdated: false,
      createdAt: {
        [Op.between]: [monthStart, monthEnd],
      },
    },
  });

  if (statements.length) {
    statements.forEach(async (statement) => {
      const stmt = await models.Statement.findByPk(statement.id);
      stmt.outdated = true;
      await stmt.save();
    });
  }
}

async function invalidateOtherInvoiceForMonth(tenant) {
  const thisMonth = moment().format('YYYY-MM');
  const monthStart = moment(thisMonth).format();
  const monthEnd = moment(thisMonth).add(1, 'month').format();

  await outdateInvoiceEntry(tenant, monthStart, monthEnd);
  await outdateStatementEntry(tenant, monthStart, monthEnd, 'invoice');
}

async function invalidateOtherReceiptForMonth(tenant) {
  const thisMonth = moment().format('YYYY-MM');
  const monthStart = moment(thisMonth).format();
  const monthEnd = moment(thisMonth).add(1, 'month').format();

  await outdateReceiptEntry(tenant, monthStart, monthEnd);
  await outdateStatementEntry(tenant, monthStart, monthEnd, 'payment');
}
export { invalidateOtherInvoiceForMonth, invalidateOtherReceiptForMonth };
