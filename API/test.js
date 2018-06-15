const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');
const routes = require('./routes');
const should = chai.should();

chai.use(chaiHttp);

describe('/GET client', () => {
    it('it should GET all the clients', (done) => {
      chai.request(app)
          .get('/client')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(2);
            done();
          });
    });
});


describe('/GET articles', () => {
    it('it should GET all articles', (done) => {
        chai.request(app)
            .get('/articles')
            .end((err, res ) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
                done();
            })
    })
})


describe('/POST client', () => {
    it('it should add new client', (done) => {
         chai.request(app)
            .post('/client')
            .set('content-type','application/x-www-form-urlencoded')
            .send({
                adresse:'atestbidon',
                codePostal:'45678',
                ville:'JESAISPAS',
                nom:'test',
                prenom:'testp',
                email:'testemil',
                numTel:'5678754',
            })
            .then(function(res){
                res.should.have.status(200);
          done();
            })
    })
})