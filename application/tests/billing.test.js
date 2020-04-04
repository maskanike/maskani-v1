import {
  aUserExistsWith, aFlatExistsWith, aUnitExistsWith,
  aTenantExistsWith, truncateModel, getAllFromModel,
} from './utils.test';

describe('Billing', () => {
  beforeEach(async () => {
    await truncateModel('Invoice');
    await truncateModel('Receipt');
    await truncateModel('Statement');
    await truncateModel('Unit');
    await truncateModel('Tenant');
    await truncateModel('Flat');
  });

  after(async () => {
    await truncateModel('Invoice');
    await truncateModel('Receipt');
    await truncateModel('Statement');
    await truncateModel('Unit');
    await truncateModel('Tenant');
    await truncateModel('Flat');
  });

  describe('POST /billing/invoice', () => {
    it('send an invoice to tenant and add record to the database', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });

      const invoice = {
        rent: 13000, water: 300, penalty: 0, garbage: 100, tenantId: tenant.id,
      };

      // expect
      const resp = await request.post('/billing/invoice').send(invoice).set('Authorization', `Bearer ${token}`).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.rent, invoice.rent);
      assert.equal(resp.body.TenantId, tenant.id);
      assert.equal(resp.body.UnitId, unit.id);

      const dbInvoice = await getAllFromModel('Invoice');
      assert.equal(dbInvoice.length, 1);
      assert.equal(dbInvoice[0].rent, invoice.rent);
      assert.equal(dbInvoice[0].TenantId, tenant.id);

      const dbStatement = await getAllFromModel('Statement');
      assert.equal(dbStatement.length, 1);
      assert.equal(dbStatement[0].type, 'invoice');
      assert.equal(
        dbStatement[0].amount,
        (invoice.rent + invoice.garbage + invoice.penalty + invoice.water),
      );
    });
  });

  describe('POST /billing/receipts', () => {
    it('send an receipt to tenant and add record to the database', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });

      const receipt = { amount: 1000, tenantId: tenant.id };

      // expect
      const resp = await request.post('/billing/receipts').send(receipt).set('Authorization', `Bearer ${token}`).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.amount, receipt.amount);
      assert.equal(resp.body.TenantId, tenant.id);
      assert.equal(resp.body.UnitId, unit.id);

      const dbReceipt = await getAllFromModel('Receipt');
      assert.equal(dbReceipt.length, 1);
      assert.equal(dbReceipt[0].amount, receipt.amount);
      assert.equal(dbReceipt[0].TenantId, tenant.id);

      const dbStatement = await getAllFromModel('Statement');
      assert.equal(dbStatement.length, 1);
      assert.equal(dbStatement[0].type, 'payment');
      assert.equal(dbStatement[0].amount, receipt.amount);
    });
  });
});
