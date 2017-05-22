"use strict";
var expect = chai.expect;
var lastCreatedId = null;
var offlineId = null;

describe('Backand SDK', () => {
  before(function() {
    localStorage.removeItem('BACKAND_user');
  });
  describe('backand.init', () => {
    it('should initiate backand namespace', () => {
      expect(backand.init).to.be.an('function');
      backand.init({
        appName: 'sdk',
        signUpToken: '851692ae-eb94-4f18-87ee-075255e67748',
        anonymousToken: '82cfcfe8-c718-4621-8bb6-cd600e23487f',
        runSocket: true,
        runOffline: true,
        allowUpdatesinOfflineMode: true,
        exportUtils: true,
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
        'offline',
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
    it('signup without parameters', function(done) {
      this.timeout(0);
      var r = Date.now() + '1';
      var email = 'testsdk_' + r + '@backand.io';
      backand.signup('first','last',email,'Password1','Password1')
        .then(res => {
          expect(res.data.username).to.eql(email);
          done();
        })
        .catch(err => {
          done(err);
        })
    });
    it('signup with parameters', function(done) {
      this.timeout(0);
      var r = Date.now() + '2';
      var email = 'testsdk_' + r + '@backand.io';
      var company = 'com'+r;
      backand.signup('first','last',email,'Password1','Password1',{company: company})
        .then(res => {
          expect(res.data.username).to.eql(email);
          backand.object.getList('users', {
            filter: [backand.helpers.filter.create('company', backand.helpers.filter.operators.text.equals, company)],
            sort: [backand.helpers.sort.create('id', backand.helpers.sort.orders.desc)]
          })
            .then(res => {
              expect(res.data[0].company).to.eql(company);
              done();
            });
        })
        .catch(err => {
          done(err);
        })
    });
    it('requestResetPassword user exists', function(done){
      this.timeout(0);
      backand.requestResetPassword('testsdk@backand.com')
        .then(res => {
          console.log(res);
          expect(res.data).to.eql('');
          done();
        })
        .catch(err => {
          done(err);
        })
    });
    it('requestResetPassword user does not exists', function(done){
      this.timeout(0);
      backand.requestResetPassword('tttt@backand.com')
          .then(res => {
            done();
          })
          .catch(err => {
            console.log(err)
            expect(err.data).to.eql('The username is not correct or does not belong to this app.');
            done();
          })
    });
    it('getUserDetails', function(done) {
      this.timeout(0);
      backand.signin('testsdk@backand.com', 'Password1')
        .then(res => {
          backand.user.getUserDetails(true)
            .then(res => {
              expect(res.data.username).to.eql('testsdk@backand.com');
              done();
            })
            .catch(err => {
              done(err);
            })
        })
        .catch(err => {
          done(err);
        });
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
      it('get with params', function(done) {
        this.timeout(0);
        let parameters = {param1: 'test1', param2: 'test2'};
        backand.object.action.get('items', 'params', parameters)
        .then(res => {
          expect(res.data).to.eql({
            "param1": "test1",
            "param2": "test2"
          });
          done();
        })
        .catch(err => {
          done(err);
        })
      });

      it('post', function() {
        this.timeout(0);
        return backand.object.action.post('items', 'socket_test', {data: "test"});
      });
      it('post with params', function(done) {
        this.timeout(0);
        backand.object.action.post('items', 'params_post', {data: "test"})
        .then(res => {
          expect(res.data).to.eql({"data": "test"});
          done();
        })
        .catch(err => {
          done(err);
        })
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
  describe('backand.bulk', () => {
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
    it('general', function() {
      this.timeout(0);
      return backand.bulk.general([
        {
          "method": "PUT",
          "url": "https://api.backand.com/1/objects/items/"+lastCreatedId,
          "data": { name:'test', description:'old item 1' }
        },
        {
          "method": "PUT",
          "url": "https://api.backand.com/1/objects/items/"+lastCreatedId,
          "data": { name:'test', description:'old item 2' }
        },
        {
          "method": "DELETE",
          "url": "https://api.backand.com/1/objects/items/"+lastCreatedId
        }
      ]);
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
    it('query GET with params', function(done) {
      this.timeout(0);
      let parameters = {param1: 'test'};
      backand.query.get('params', parameters)
      .then(res => {
        expect(res.data).to.eql([{"param1": "test"}]);
        done();
      })
      .catch(err => {
        done(err);
      })
    });
    it('query POST with params', function(done) {
      this.timeout(0);
      let parameters = '15307761,11505377,97900964,19480764,1701480,1700243,1700306,38038826,1600771,1701778,1700310,2642509,11405234,149820,158421,39914254,46574,49357485,158628,1607000,69998440,95967,1602967,94280929,97904,92657,1700252,92597645,93772,1700527,94767,147093,94057,175255,24336424,21118874,151064,97593,155883,27438545,152242,100023507,1700594,217002283,98092,19494501,149213,97915,998835,1400598,98647535,24776433,9398048,154495,98244,92113,130949,1700596,244596,44856,1604060,216040505,149486,1700550,31560447,92543,142158,93958,100019833,100028520,70086768,6546794,176683,148025,98333,149921,1600479,94507,1701770,100018160,75790286,543756,1700016,92173,1605109,173758,16468417,94470,29145945,10902745,100042823,246909,94196,150097,1700296,157593,158629,158193,92172,97651,98075,152243,18354441,4554434,1604197,151566,1700193,157788,97433,158243,157389,97548,158195,62692445,155417,75655764,174379,59757649,217001852,94389,85617847,46293,153390,68068854,11502868,156517,90225,100038584,157633,176092,156557,1606734,94194,156955,138694,138607,93466,58219,93471440,136342,46279,157546,1700332,97090,64177909,1701343,156061,149979,71609944,85979,1700255,23657336,45001,38879174,27733788,158526,1700229,100053676,2105419,143607,86668974,1602705,14606334,155893,98407,97516,149345,97037,1602512,98135,151424,1507132,96473,98078,216043409,158548,3358071,148165,31380945,17015150,1401699,80344290,1605655,149202,45912,52520422,211809,2702300,98476,100052539,57696928,246859,148697,96071,66218,85284284,100019705,46403,51240584,145222,45042,244594,26543140,32065404,91468238,245930,25878780,97999,1700185,36697174,150240,154012,98501,98487,154917,157954,28741125,156300,149058,34855381,17835528,14441429,90658,1394948,100051968,158509,91473,95138,46805,24803397,1501266,1603284,98650864,155916,100007743,78731949,1700218,153823,156801,46719,100055678,1701629,136333,98647372,100046632,214039991,94890,93729,156442,151351,100053798,90227,46470,157931,155210,1700500,1605998,98283,1700374,1605064,46717,155186,1700848,100051610,100036736,149120,1700031,13144991,75756422,78853,246148,13408541,146822,158146,51662747,100024242,94826,93682,1605065,68295456,100028715,157417,1606574,158017,246244,11405231,158457,1700265,94385,1604445,97492,1603092,1039204,90722,1701220,18834284,45718485,64530981,94624,94801,246608,151743,216042284,4594614,153757,156100,1700313,94563,246045,170003030,998908,156466,176830,1606473,60978905,1402838,100031285,94964,151158,2036493,94754,97911,155805,176347,16626347,83076,151367,147150,247062,97443,93918,98522,1700875,49281214,44373,176372,153490,1700233,147446,1701444,84363,80240984,147988,143289,66866847,97620,98472,131661,1007250,98468,242717,21369692,176521,156349,217002703,1606824,97808,47755494,4219414,46195,1602651,1700058,151929,86666894,94918,45591,94634,1061584,155465,1606736,100015127,46378,158762,151096,147570,98650620,77785,1302849,158675,150436,1605849,100004747,98457,126136,156318,1606830,97946,93276,157880,1700543,1700555,216038330,94660,100048630,158666,158624,41856,98104,1606846,29881642,98070,119397,95993,155784,157951,158530,100053097,141077,14505924,1272029,1701811,1604019,98437,45470,1700610,46649,41858314,97939,128809,80244,60511918,100028888,82497,149352,48112219,100000998,25777803,44950,94134,156069,144029,155597,2106378,30554394,1700917,150432,98326,11503130,242669,160157,98148,156382,98084,1601982,98231,100025873,95027,98377,95736540,94686,90448,150816,94986,97829,154086,158215,36742574,94044,158557,158019,1606597,30610544,46115,66714581,81590833,93995,158546,158023,150534,99535012,154540,99101445,97362,97901,1602404,46777,998782,93905,1607135,503947,89428789,46778,156303,95007,76573448,94091,157946,96892,23725737,100007664,4756014,153794,95996637,156516,95909806,93324,80756968,154964,53503459,11401526';
      backand.query.post('params', {param1: parameters})
      .then(res => {
        expect(res.data).to.eql([{"param1": parameters}]);
        done();
      })
      .catch(err => {
        done(err);
      })
    });
  });
  describe('backand.user', () => {
    it('getUserDetails', function() {
      this.timeout(0);
      return backand.user.getUserDetails(true);
    });
  });
  describe('backand.fn', () => {
    it('get', function() {
      this.timeout(0);
      return backand.fn.get('lmTest1', {param: 'test'});
    });
    it('post', function() {
      this.timeout(0);
      return backand.fn.post('lmTest1', {}, {param: 'test'});
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
  describe('backand.offline', () => {
    it('should have cache and queue in localStorage', () => {
      expect(backand.utils.storage.get('cache')).to.be.an('object');
      expect(backand.utils.storage.get('queue')).to.be.an('array');
      expect(backand.offline.cache).to.be.an('object');
      expect(backand.offline.queue).to.be.an('array');
      backand.utils.storage.set('cache', {});
      backand.utils.storage.set('queue', []);
    });
    it('should cache getList calls', function(done) {
      this.timeout(0);
      var response;
      backand.object.getList('offline').then(res => {
        response = res;
        backand.offline.setOfflineMode(true);
        return backand.object.getList('offline');
      }).then(res => {
        expect(res).to.eql(response);
        return backand.object.getList('items');
      }).then(res => {
        expect(res.data).to.eql([]);
        backand.offline.setOfflineMode(false);
        done();
      }).catch(err => {
        done(err);
      });
    });
    it('should cache getOne calls', function(done) {
      this.timeout(0);
      var response;
      backand.object.getOne('offline', 3).then(res => {
        response = res;
        backand.offline.setOfflineMode(true);
        return backand.object.getOne('offline', 3);
      }).then(res => {
        expect(res).to.eql(response);
        backand.offline.setOfflineMode(false);
        done();
      }).catch(err => {
        done(err);
      })
    });
    it('should cache query calls', function(done) {
      this.timeout(0);
      var response;
      let parameters = {param1: 'test'};
      backand.query.post('params', parameters).then(res => {
        response = res;
        backand.offline.setOfflineMode(true);
        return backand.query.post('params', parameters);
      }).then(res => {
        expect(res).to.eql(response);
        backand.offline.setOfflineMode(false);
        done();
      }).catch(err => {
        done(err);
      })
    });
    it('should queue create calls', function(done) {
      this.timeout(0);
      backand.offline.setOfflineMode(true);
      backand.defaults.beforeExecuteOfflineItem = (request) => {
        if(request.data.text !== 'DontCheckMe') return true;
        return false;
      };
      backand.defaults.afterExecuteOfflineItem = (response) => {
        console.log(response);
        if(backand.offline.queue.length === 0) done();
      };
      backand.object.create('offline', {text:'test'}).then(res => {
        expect(res.status).to.eql(1);
        return backand.object.create('offline', {text:'DontCheckMe'})
      }).then(res => {
        expect(res.status).to.eql(1);
        return backand.object.create('offline', {text:'test3'})
      }).then(res => {
        expect(res.status).to.eql(1);
        expect(backand.offline.queue.length).to.eql(3);
        backand.offline.setOfflineMode(false);
      }).catch(err => {
        done(err);
      })
    });
    it('should queue update and remove calls', function(done) {
      this.timeout(0);
      backand.defaults.beforeExecuteOfflineItem = (request) => {
        return true;
      };
      backand.defaults.afterExecuteOfflineItem = (response) => {
        console.log(response);
        if(backand.offline.queue.length === 0) done();
      };
      backand.object.create('offline', {text:'test'}).then(res => {
        expect(res.status).to.eql(200);
        lastCreatedId = res.data.__metadata.id;
        backand.offline.setOfflineMode(true);
        return backand.object.update('offline', lastCreatedId, {text:'test1'});
      }).then(res => {
        expect(res.status).to.eql(1);
        return backand.object.update('offline', lastCreatedId, {text:'test2'});
      }).then(res => {
        expect(res.status).to.eql(1);
        return backand.object.remove('offline', lastCreatedId);
      }).then(res => {
        expect(res.status).to.eql(1);
        expect(backand.offline.queue.length).to.eql(3);
        backand.offline.setOfflineMode(false);
      }).catch(err => {
        done(err);
      })
    });
  });
  describe('backand.invloke', () => {
    it('invoke to get functions', function(done) {
      this.timeout(0);
      var params = {filter:[{fieldName:"actionType", operator:"equals", value:"Function"}],pageSize:200};
      let json = {
        method: 'GET',
        url: '/1/action/config',
        params: params
      };
      backand.invoke(json).then(res => {
        expect(res.data.data[0].actionType).to.eql('Function');
        done();
      }).catch(err => {
        done(err);
      })
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
