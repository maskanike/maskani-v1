import { 
  aTenantExistsWith, findByID, getAllFromModel, aFlatExistsWith, aUnitExistsWith, aUserExistsWith, truncateModel
} from './utils.test';

describe('Tenants', () => {
  beforeEach(async () => {
    await truncateModel('Unit');
    await truncateModel('Tenant');
    await truncateModel('Flat');
  });
  describe('GET /tenant', () => {
    it('should get all tenant', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });
      const user = await aUserExistsWith({ name: 'sam', email: "admin@flatspad.com" });
      await aTenantExistsWith({
        rent: 1000, deposit: 100, balance: 0, water: 0, FlatId:flat.id, UserId:user.id, UnitId:unit.id
      });

      // expect
      const resp = await request.get(`/tenant?flatId=${flat.id}`).set('Authorization', 'Bearer ' + token).expect(200);
      console.log('resp: ', resp.body);

      // when
      resp.body.should.be.a('array');
      resp.body.length.should.be.eql(1);
      assert.equal(resp.body[0].rent, 1000);
    });
  });

  describe('POST /tenant', () => {
    it('should create a new tenant', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });
      const user = await aUserExistsWith({ name: 'sam', email: "admin@flatspad.com" });
      const tenant = { rent: 1000, water: 150, garbage: 100, flatId:flat.id, userId:user.id, unitId: unit.id };

      // expect
      const resp = await request.post(`/tenant`).set('Authorization', 'Bearer ' + token).send(tenant).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.garbage, 100);
      assert.equal(resp.body.rent, 1000);
      assert.equal(resp.body.water, 150);
    });
  });

  describe('PUT /tenant/:id tenant', () => {
    it('should UPDATE a tenant given their id', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });
      const user = await aUserExistsWith({ name: 'sam', email: "admin@flatspad.com" });
      const tenant = await aTenantExistsWith({ rent: 2000, deposit: 100 });
      
      const updatedTenant = { rent: 1000, deposit: 1000, balance: 100, flatId:flat.id, userId:user.id, unitId: unit.id };

      // expect
      await request.put(`/tenant/${tenant.id}`)
        .send(updatedTenant)
        .set('Authorization', 'Bearer ' + token)
        .expect(200);

      // when
      const tenantAfterUpdate = await findByID('Tenant', tenant.id);
      assert.equal(tenantAfterUpdate.rent, 1000);
      assert.equal(tenantAfterUpdate.deposit, 1000);
    });
  });

  describe('DELETE /tenant/:id tenant', () => {
    it('should DELETE a tenant given their id', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });
      const user = await aUserExistsWith({ name: 'sam', email: "admin@flatspad.com" });
      const tenant = await aTenantExistsWith({
        rent: 1000, deposit: 100, balance: 0, water: 0, FlatId:flat.id, UserId:user.id, UnitId:unit.id
      });

      const tenants = await getAllFromModel('Tenant');
      tenants.length.should.be.eql(1);
      // expect
      await request.delete(`/tenant/${tenant.id}`).set('Authorization', 'Bearer ' + token).expect(200);

      // when
      const tenantsAfterDeletion = await getAllFromModel('Tenant');
      tenantsAfterDeletion.length.should.be.eql(0);
    });
  });
});
