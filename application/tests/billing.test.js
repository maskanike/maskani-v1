import {
  aUserExistsWith, aFlatExistsWith, aUnitExistsWith, anInvoiceExistsWith,
  aTenantExistsWith, aStatementExistsWith, aReceiptExistsWith, truncateModel,
  getAllFromModel,
} from './utils.test';

describe('Billing', () => {
  beforeEach(async () => {
    await truncateModel('Invoice');
    await truncateModel('Receipt');
    await truncateModel('Statement');
    await truncateModel('Tenant');
    await truncateModel('Unit');
    await truncateModel('Flat');
  });

  after(async () => {
    await truncateModel('Invoice');
    await truncateModel('Receipt');
    await truncateModel('Statement');
    await truncateModel('Tenant');
    await truncateModel('Unit');
    await truncateModel('Flat');
  });

  describe('POST /billing/invoices', () => {
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
      const resp = await request.post('/billing/invoices').send(invoice).set('Authorization', `Bearer ${token}`).expect(201);

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

    it('should invalidate invoice if another is sent in same month', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });
      const statement = await aStatementExistsWith({ amount: 13400, type: 'invoice', TenantId: tenant.id });
      const invoice = await anInvoiceExistsWith({
        rent: 13000, water: 300, penalty: 0, garbage: 100, TenantId: tenant.id,
      });

      const invoiceData = {
        rent: 12000, water: 400, penalty: 100, garbage: 50, tenantId: tenant.id,
      };

      // expect
      const resp = await request.post('/billing/invoices').send(invoiceData).set('Authorization', `Bearer ${token}`).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.rent, invoiceData.rent);
      assert.equal(resp.body.TenantId, tenant.id);
      assert.equal(resp.body.UnitId, unit.id);

      const dbInvoice = await getAllFromModel('Invoice');
      assert.equal(dbInvoice.length, 2);
      assert.equal(dbInvoice[0].rent, invoice.rent);
      assert.equal(dbInvoice[0].outdated, true);
      assert.equal(dbInvoice[0].TenantId, tenant.id);

      assert.equal(dbInvoice[1].rent, invoiceData.rent);
      assert.equal(dbInvoice[1].TenantId, tenant.id);
      assert.equal(dbInvoice[1].outdated, false);


      const dbStatement = await getAllFromModel('Statement');
      assert.equal(dbStatement.length, 2);
      assert.equal(dbStatement[0].type, 'invoice');
      assert.equal(dbStatement[0].amount, statement.amount);
      assert.equal(dbStatement[0].outdated, true);

      assert.equal(dbStatement[1].type, 'invoice');
      assert.equal(dbStatement[1].amount, 12550);
      assert.equal(dbStatement[1].outdated, false);
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

    it('should invalidate receipt if another is sent in same month', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });
      const statement = await aStatementExistsWith({ amount: 13400, type: 'payment', TenantId: tenant.id });
      const receipt = await aReceiptExistsWith({ amount: 1400, TenantId: tenant.id });

      const receiptData = { amount: 13400, tenantId: tenant.id };

      // expect
      const resp = await request.post('/billing/receipts').send(receiptData).set('Authorization', `Bearer ${token}`).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.amount, receiptData.amount);
      assert.equal(resp.body.TenantId, tenant.id);
      assert.equal(resp.body.UnitId, unit.id);

      const dbReceipt = await getAllFromModel('Receipt');
      assert.equal(dbReceipt.length, 2);
      assert.equal(dbReceipt[0].amount, receipt.amount);
      assert.equal(dbReceipt[0].outdated, true);
      assert.equal(dbReceipt[0].TenantId, tenant.id);

      assert.equal(dbReceipt[1].amount, receiptData.amount);
      assert.equal(dbReceipt[1].TenantId, tenant.id);
      assert.equal(dbReceipt[1].outdated, false);


      const dbStatement = await getAllFromModel('Statement');
      assert.equal(dbStatement.length, 2);
      assert.equal(dbStatement[0].type, 'payment');
      assert.equal(dbStatement[0].amount, statement.amount);
      assert.equal(dbStatement[0].outdated, true);

      assert.equal(dbStatement[1].type, 'payment');
      assert.equal(dbStatement[1].amount, receiptData.amount);
      assert.equal(dbStatement[1].outdated, false);
    });
  });

  describe('GET /billing', () => {
    it('should get all past invoices when provided flatId', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });
      const invoice = await anInvoiceExistsWith({
        rent: 13000, water: 300, penalty: 0, garbage: 100, TenantId: tenant.id, UnitId: unit.id,
      });

      // create second tenant
      const tenant2 = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit2 = await aUnitExistsWith({ name: 'unit 2', FlatId: flat.id, TenantId: tenant2.id });
      const invoice2 = await anInvoiceExistsWith({
        rent: 12500, water: 0, penalty: 0, garbage: 0, TenantId: tenant2.id, UnitId: unit2.id,
      });

      // expect
      const resp = await request.get(`/billing/invoices?flatId=${flat.id}`).set('Authorization', `Bearer ${token}`).expect(200);

      // when
      resp.body.should.be.a('array');
      resp.body.length.should.be.eql(2);
      assert.equal(resp.body[0].rent, invoice.rent);
      assert.equal(resp.body[1].rent, invoice2.rent);
    });

    it('should get all past receipts when provided flatId', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const user = await aUserExistsWith({ name: 'sam', email: 'admin@flatspad.com' });
      const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });
      const receipt = await aReceiptExistsWith({
        amount: 13900, TenantId: tenant.id, UnitId: unit.id,
      });

      // create second tenant
      const tenant2 = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
      const unit2 = await aUnitExistsWith({ name: 'unit 2', FlatId: flat.id, TenantId: tenant2.id });
      const receipt2 = await aReceiptExistsWith({
        rent: 12600, TenantId: tenant2.id, UnitId: unit2.id,
      });

      // expect
      const resp = await request.get(`/billing/receipts?flatId=${flat.id}`).set('Authorization', `Bearer ${token}`).expect(200);

      // when
      resp.body.should.be.a('array');
      resp.body.length.should.be.eql(2);
      assert.equal(resp.body[0].amount, receipt.amount);
      assert.equal(resp.body[1].amount, receipt2.amount);
    });
  });
});
