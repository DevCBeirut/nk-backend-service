let sails = require('sails');

before(function (done) {
    this.timeout(5000);

    sails.lift({
        log: {
            level: 'debug'
        },
        hooks: {
            grunt: false
        },
    }, (err) => {
        if (err) {
            return done(err);
        }
        return done();
    });
});

after((done) => {
    sails.lower(done);
})