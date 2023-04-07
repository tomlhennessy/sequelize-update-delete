const { setupBefore, setupChai, removeTestDB, runSQLQuery } = require('./utils/test-utils');
const chai = setupChai();
const expect = chai.expect;

describe('Delete a puppy by id', () => {
  let DB_TEST_FILE, SERVER_DB_TEST_FILE, models, server;
  before(async () => ({ server, models, DB_TEST_FILE, SERVER_DB_TEST_FILE } = await setupBefore(__filename)));
  after(async () => await removeTestDB(DB_TEST_FILE));

  it('should delete the puppy and match the API specs for a seeded puppy', async () => {
    let id = 1;
    await chai.request(server)
      .delete(`/puppies/${id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('puppy');
        expect(res.body.puppy.name).to.eq("Cooper");
        expect(res.body.puppy.age_yrs).to.eq(1);
        expect(res.body.puppy.breed).to.eq("Miniature Schnauzer");
        expect(res.body.puppy.weight_lbs).to.eq(18);
        expect(res.body.puppy.microchipped).to.eq(true);
      });
    const [cooper] = await runSQLQuery(`SELECT * FROM 'Puppies' WHERE id = ${id}`, SERVER_DB_TEST_FILE);
    expect(cooper).to.be.undefined;
  });

  it('should delete the puppy and match the API specs for a newly created puppy', async () => {
    test = await models.Puppy.create({id: 99, name: 'Test', age_yrs: 9, breed: 'Labrador', weight_lbs: 2, microchipped: false})
    let id = test.id;
    await chai.request(server)
      .delete(`/puppies/${id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('puppy');
        expect(res.body.puppy.name).to.eq("Test");
        expect(res.body.puppy.age_yrs).to.eq(9);
        expect(res.body.puppy.breed).to.eq("Labrador");
        expect(res.body.puppy.weight_lbs).to.eq(2);
        expect(res.body.puppy.microchipped).to.eq(false);
      });
    const [testPup] = await runSQLQuery(`SELECT * FROM 'Puppies' WHERE id = ${id}`, SERVER_DB_TEST_FILE);
    expect(testPup).to.be.undefined;
  });
});