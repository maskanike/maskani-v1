import { 
 findByID, getAllFromModel, aFlatExistsWith, aUnitExistsWith, truncateModel
} from './utils.test';

describe('Units', () => {
  beforeEach(async () => {
    await truncateModel('Unit');
    await truncateModel('Flat');
  });

  describe('GET /admin/unit', () => {
    it('should get all unit', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      await aUnitExistsWith({ name: 'unit 1', FlatId: flat.id });

      // expect
      const resp = await request.get(`/admin/unit?flatId=${flat.id}`).set('Authorization', 'Bearer ' + token).expect(200);

      // when
      resp.body.should.be.a('array');
      resp.body.length.should.be.eql(1);
      assert.equal(resp.body[0].name, 'unit 1');
    });
  });

  describe('POST /admin/unit', () => {
    it('should create a new unit', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = { name: 'unit 1', flatId: flat.id };

      // expect
      const resp = await request.post(`/admin/unit`).set('Authorization', 'Bearer ' + token).send(unit).expect(201);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.name, 'unit 1');
    });
  });

  describe('PUT /admin/unit/:id unit', () => {
    it('should UPDATE a unit given their id', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });;
      const updatedUnit = { name: 'unit 2' };

      // expect
      await request.put(`/admin/unit/${unit.id}`)
        .send(updatedUnit)
        .set('Authorization', 'Bearer ' + token)
        .expect(200);

      // when
      const unitAfterUpdate = await findByID('Unit', unit.id);
      assert.equal(unitAfterUpdate.name, 'unit 2');
    });
  });

  describe('DELETE /admin/unit/:id unit', () => {
    it('should DELETE a unit given their id', async () => {
      // given
      const flat = await aFlatExistsWith({ name: 'magondu flat' });
      const unit = await aUnitExistsWith({ name: 'unit 1', flatId: flat.id });

      const units = await getAllFromModel('Unit');
      units.length.should.be.eql(1);

      // expect
      await request.delete(`/admin/unit/${unit.id}`).set('Authorization', 'Bearer ' + token).expect(200);

      // when
      const unitsAfterDeletion = await getAllFromModel('Unit');
      unitsAfterDeletion.length.should.be.eql(0);
    });
  });
});
