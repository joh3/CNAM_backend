const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');
const routes = require('./routes');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET client', () => {
    it('it should GET all the clients', (done) => {
      chai.request(app)
          .get('/client')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(1);
            done();
          });
    });
});
