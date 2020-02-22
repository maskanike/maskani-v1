import {
    aUserExistsWith, aFlatExistsWith, aUnitExistsWith, aTenantExistsWith, truncateModel
} from './utils.test';

describe('Billing', () => {
    beforeEach(async () => {
        await truncateModel('Invoice');
        await truncateModel('Statement');
        await truncateModel('Unit');
        await truncateModel('Tenant');
        await truncateModel('Flat');
    });

    after(async () => {
        await truncateModel('Invoice');
        await truncateModel('Statement');
        await truncateModel('Unit');
        await truncateModel('Tenant');
        await truncateModel('Flat');
    })

    describe('POST /billing/invoice', () => {
        it('send an invoice to tenant and add record to the database', async () => {
            // given
            const flat = await aFlatExistsWith({ name: 'magondu flat' });
            const user = await aUserExistsWith({ name: 'sam', email: "admin@flatspad.com" });
            const tenant = await aTenantExistsWith({ FlatId: flat.id, UserId: user.id });
            const unit = await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id, TenantId: tenant.id });

            const invoice = { rent: 13000, water: 300, penalty: 0, garbage: 100, tenantId: tenant.id };

            // expect
            const resp = await request.post(`/billing/invoice`).send(invoice).set('Authorization', 'Bearer ' + token).expect(201);

            // when
            console.log(resp.body);
            resp.body.should.be.a('object');
            assert.equal(resp.body.rent, invoice.rent);
            assert.equal(resp.body.TenantId, tenant.id);
            assert.equal(resp.body.UnitId, unit.id);
            // Assert statement entry, invoice entry
        });
    });
});