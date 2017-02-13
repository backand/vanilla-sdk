var expect = chai.expect;
var lastCreatedId = null;

describe('Backand SDK', () => {
  describe('backand.init', () => {
    it('should initiate backand namespace', () => {
      expect(backand.init).to.be.an('function');
      backand.init({
        appName: 'sdk',
        signUpToken: '851692ae-eb94-4f18-87ee-075255e67748',
        anonymousToken: '82cfcfe8-c718-4621-8bb6-cd600e23487f',
        runSocket: true
      });
      expect(backand).to.be.an('object');
      expect(backand).to.include.keys(
        'constants',
        'helpers',
        'defaults',
        'object',
        'file',
        'query',
        'user',
        'useAnonymousAuth',
        'signin',
        'signup',
        'socialSignin',
        'socialSigninWithToken',
        'socialSignup',
        'requestResetPassword',
        'resetPassword',
        'changePassword',
        'signout',
        'getSocialProviders',
        'on'
      );
    });
  });
  describe('backand.auth', () => {
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
    it('changePassword', function() {
      this.timeout(0);
      return backand.changePassword('Password1','Password2').then(()=> {
        return backand.changePassword('Password2', 'Password1');
      })
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
  describe('backand.object', () => {
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
    describe('backand.object.action', () => {
      it('get', function() {
        this.timeout(0);
        return backand.object.action.get('items', 'socket_test');
      });
      it('post', function() {
        this.timeout(0);
        return backand.object.action.post('items', 'socket_test', {data: "test"});
      });
    });
    it('field types', function() {
      this.timeout(0);
      return backand.object.create('tests', {
        point: [Math.floor((Math.random() * 10) + 1), Math.floor((Math.random() * 10) + 1)],
        datetime: new Date(),
        boolean: Math.random() < 0.5 ? false : true,
        float: Math.random() * (Math.random() < 0.5 ? -1 : 1),
      });
    });
    it('filter types', function(done) {
      this.timeout(0);
      let boolFilter = Math.random() < 0.5 ? false : true;
      backand.object.getList('tests', {
        filter: [backand.helpers.filter.create('boolean', backand.helpers.filter.operators.boolean.equals, boolFilter)],
        sort: [backand.helpers.sort.create('datetime', backand.helpers.sort.orders.desc)]
      })
      .then(res => {
        res.data.forEach(elem => expect(elem.boolean).to.be[boolFilter]);
        done();
      })
      .catch(err => {
        done(err);
      })
    });
  });
  describe('backand.file', () => {
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
  describe('backand.query', () => {
    it('get', function() {
      this.timeout(0);
      return backand.query.get('getItemsCount');
    });
  });
  describe('backand.user', () => {
    it('getUserDetails', function() {
      this.timeout(0);
      return backand.user.getUserDetails(true);
    });
  });
  describe('backand.helpers', () => {
    it('should have some impotant keys', () => {
      expect(backand.helpers).to.include.keys('filter', 'sort', 'exclude', 'StorageAbstract', 'MemoryStorage');
    });
  });
  describe('backand.constants', () => {
    it('should have some impotant keys', () => {
      expect(backand.constants).to.include.keys('EVENTS', 'URLS', 'SOCIAL_PROVIDERS');
    });
  });
  describe('backand.on', () => {
    it('should have on function', () => {
      expect(backand.on).to.be.an('function');
    });
    it('should listen to events from server', function(done) {
      this.timeout(5000);
      backand.on('socket_test', data => {
        expect(data).to.eql('test');
        done();
      });
      setTimeout(()=>{
        backand.object.action.get('items', 'socket_test')
        .catch(err => {
          done(err);
        })
      }, 1000);
    });
  });
});
