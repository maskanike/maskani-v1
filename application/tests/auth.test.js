import {
  aUserExistsWith, truncateModel, getAllFromModel,
} from './utils.test';

describe.only('Auth', () => {
  beforeEach(async () => {
    await truncateModel('User');
  });

  after(async () => {
    await truncateModel('User');
  });

  describe('POST /auth/signup', () => {
    it('shoud sucessfully add a new user to the database', async () => {
      // given
      const user = {
        email: 'sam@maskani.co.ke', name: 'maskani', msisdn: '0723453841', password1: '123', password2: '123',
      };

      // expect
      const resp = await request.post('/auth/signup').send(user).set('Authorization', `Bearer ${token}`).expect(201);
      console.log('resp: ', resp.body);
      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.user.email, user.email);

      const dbUser = await getAllFromModel('User');
      assert.equal(dbUser.length, 1);
      assert.equal(dbUser[0].email, user.email);
      assert.equal(dbUser[0].name, user.name);
      assert.equal(dbUser[0].msisdn, user.msisdn);
      assert.notEqual(dbUser[0].password, user.password1);
    });

    it('shoud fail to signup if passwords do not match', async () => {
      // given
      const user = {
        name: 'sam', email: 'admin@flatspad.com', password1: '123', password2: '456', msisdn: '0723453841',
      };

      // expect
      const resp = await request.post('/auth/signup').send(user).set('Authorization', `Bearer ${token}`).expect(400);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.error, 'passwords do not match');
    });

    it('shoud fail to signup if email already exists', async () => {
      // given
      const user = {
        name: 'sam', email: 'admin@flatspad.com', password1: '123', password2: '123', msisdn: '012345',
      };
      await aUserExistsWith(user);

      // expect
      const resp = await request.post('/auth/signup').send(user).set('Authorization', `Bearer ${token}`).expect(400);

      // when
      resp.body.should.be.a('object');
      assert.equal(resp.body.error, 'email already registered');
    });

    it('shoud signup user with msisdn without spaces', async () => {
      const user = {
        name: 'sam', email: 'admin@flatspad.com', password1: '123', password2: '123', msisdn: '0723 453 841',
      };

      // expect
      await request.post('/auth/signup').send(user).set('Authorization', `Bearer ${token}`).expect(201);

      // when
      const dbUser = await getAllFromModel('User');
      assert.equal(dbUser.length, 1);

      const msisdn = user.msisdn.replace(/ /g, '');
      assert.equal(dbUser[0].msisdn, msisdn);
    });
  });
});
