const supertest = require('supertest');
const assert = require('assert').strict;

describe('Get Persons Controller', () => {
    it('Success - Should return a 200 response', (done) => {
        supertest(sails.hooks.http.app)
            .get('/persons')
            .expect(200)
            .end((error, response) => {
                if(!response || !response.body)
                    throw new Error(`Response Not returned`);
                assert.deepEqual(response.body.status, "success");
                return done();
            })
    });
  
});