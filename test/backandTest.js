var expect = chai.expect;
var lastCreatedId = null;

describe('Backand.initiate', () => {
  it('should initiate backand namespace', () => {
    expect(backand.init).to.be.an('function');
    backand.init({
      appName: 'sdk',
      signUpToken: '851692ae-eb94-4f18-87ee-075255e67748',
      anonymousToken: '82cfcfe8-c718-4621-8bb6-cd600e23487f',
      runSocket: true
    });
    expect(backand).to.be.an('object');
    // expect(backand).to.have.all.keys('service', 'constants', 'helpers', 'socket');
  });

  describe('Backand.service', () => {
    describe('auth', () => {
      it('useAnonymousAuth', function(done) {
        this.timeout(0);
        backand.useAnonymousAuth()
        .then(res => {
          expect(res.data.username).to.eql('Guest');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('useAnonymousTokenByDefault', function(done) {
        this.timeout(0);
        backand.signout()
        .then(res => {
          return backand.user.getUserDetails(true);
        })
        .then(res => {
          expect(res.data.username).to.eql('Guest');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('signin', function(done) {
        this.timeout(0);
        backand.signin('testsdk@backand.com', 'Password1')
        .then(res => {
          expect(res.data.username).to.eql('testsdk@backand.com');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('getUserDetails', function(done) {
        this.timeout(0);
        backand.user.getUserDetails(true)
        .then(res => {
          expect(res.data.username).to.eql('testsdk@backand.com');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('changePassword 1', function() {
        this.timeout(0);
        return backand.changePassword('Password1','Password2')
      });
      it('changePassword 2', function() {
        this.timeout(0);
        return backand.changePassword('Password2', 'Password1');
      });
      it('handleRefreshToken', function(done) {
        this.timeout(0);
        localStorage.setItem('BACKAND_user', 'JSON__________{"token":{"Authorization":"Bearer 40TnXDDXpTBRs5cmYfeq5DfCQyi4ggPzz-i7Dd31pBPpt847TC8pr_ldBqg5iGvCnlPTX5ruVPiUzAvGbXsTxjK3eFGSKiKHzIUfXaqsLdX597UuIiLSYxJiIA11wJKfaFmF6rCGBm8ZAErUwga0aB2EEjSiYJYon8MWTIoaddfPgJo6I9hbAXESShNSe5hNl_9RMVjRbGXy2uDV-Vw_HmtcmTLkNGpRPTBnUt_8X71DaK0sdmxSP5FQlkY8nVyr"},"details":{"access_token":"40TnXDDXpTBRs5cmYfeq5DfCQyi4ggPzz-i7Dd31pBPpt847TC8pr_ldBqg5iGvCnlPTX5ruVPiUzAvGbXsTxjK3eFGSKiKHzIUfXaqsLdX597UuIiLSYxJiIA11wJKfaFmF6rCGBm8ZAErUwga0aB2EEjSiYJYon8MWTIoaddfPgJo6I9hbAXESShNSe5hNl_9RMVjRbGXy2uDV-Vw_HmtcmTLkNGpRPTBnUt_8X71DaK0sdmxSP5FQlkY8nVyr","token_type":"bearer","expires_in":1799,"refresh_token":"ADFqy2qOqdIlVbstcDTkgUX9ui1PtnjRcGgQLJ85pmAFuAxaVxZFaZjyM0FiriUOag==","appName":"sdk","username":"sdk@backand.com","role":"User","firstName":"sdk","lastName":"test","fullName":"sdk test","regId":782463,"userId":"2"}}')
        backand.user.getUserDetails(true)
        .then(res => {
          expect(res.data.username).to.eql('sdk@backand.com');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('signout', function(done) {
        this.timeout(0);
        backand.signout()
        .then(res => {
          expect(res.data).to.be.null;
          done();
        })
        .catch(err => {
          done(err);
        })
      });
    });
    describe('crud', () => {
      it('getList', function() {
        this.timeout(0);
        return backand.object.getList('items');
      });
      it('create', function(done) {
        this.timeout(0);
        backand.object.create('items',{
          name:'test',
          description:'new item'
        })
        .then(res => {
          lastCreatedId = res.data.__metadata.id;
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('getOne 1', function(done) {
        this.timeout(0);
        backand.object.getOne('items', lastCreatedId)
        .then(res => {
          expect(res.data.description).to.eql('new item');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('update', function() {
        this.timeout(0);
        return backand.object.update('items',lastCreatedId, {
          name:'test',
          description:'old item'
        });
      });
      it('getOne 2', function(done) {
        this.timeout(0);
        backand.object.getOne('items', lastCreatedId)
        .then(res => {
          expect(res.data.description).to.eql('old item');
          done();
        })
        .catch(err => {
          done(err);
        })
      });
      it('remove', function() {
        this.timeout(0);
        return backand.object.remove('items', lastCreatedId);
      });
    });
    describe('files', () => {
      it('upload', function(done) {
        this.timeout(0);
        var file = new File(["test"], 'file2upload');
        var reader  = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", function () {
          backand.file.upload('items', 'files', file.name, reader.result)
          .then(res => {
            done();
          })
          .catch(err => {
            done(err);
          })
        }, false);
      });
      it('remove', function() {
        this.timeout(0);
        return backand.file.remove('items','files', 'file2upload');
      });
    });
  });
  describe('Backand.helpers', () => {
    it('should have some impotant keys', () => {
      expect(backand.helpers).to.have.all.keys('filter', 'sort', 'exclude', 'StorageAbstract', 'MemoryStorage');
    });
  });
  describe('Backand.constants', () => {
    it('should have some impotant keys', () => {
      expect(backand.constants).to.have.all.keys('EVENTS', 'URLS', 'SOCIAL_PROVIDERS');
    });
  });
  describe('Backand.socket', () => {
    it('should have on function', () => {
      expect(backand.on).to.be.an('function');
    });
    it('should listen to events from server', function(done) {
      this.timeout(5000);
      backand.on('socket_test', data => {
        console.log(data);
        expect(data).to.eql('test');
        done();
      });
      setTimeout(()=>{
        backand.object.action.get('items', 'socket_test')
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          done(err);
        })
      }, 2000);
    });
  });
});
