/***********************************************
 * backand JavaScript Library
 * Authors: backand
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Compiled At: 26/11/2016
 ***********************************************/
import defaults from './defaults'
import * as constants from './constants'
import * as helpers from './helpers'

import utils from './utils/utils'
import Storage from './utils/storage'
import Http from './utils/http'
import Socket from './utils/socket'
import detect from './utils/detector'

import auth from './services/auth'
import object from './services/object'
import file from './services/file'
import query from './services/query'
import user from './services/user'

// TASK: run tests to identify the runtime environment
var detector = detect();

// TASK: get data from url in social sign-in popup
if(window.location && detector.env !== 'node' && detector.env !== 'react-native') {
  let dataMatch = /(data|error)=(.+)/.exec(window.location.href);
  if (dataMatch && dataMatch[1] && dataMatch[2]) {
    let data = {
      data: JSON.parse(decodeURIComponent(dataMatch[2].replace(/#.*/, '')))
    }
    data.status = (dataMatch[1] === 'data') ? 200 : 0;
    if (detector.type !== 'Internet Explorer') {
      window.opener.postMessage(JSON.stringify(data), location.origin);
    }
    else {
      localStorage.setItem('SOCIAL_DATA', JSON.stringify(data));
    }
  }
}

let backand = {
  constants,
  helpers,
}
backand.init = (config = {}) => {

  // TASK: combine defaults with user config
  Object.assign(defaults, config);
  // console.log(defaults);

  // TASK: verify new defaults
  if (!defaults.appName)
    throw new Error('appName is missing');
  if (!defaults.anonymousToken && defaults.useAnonymousTokenByDefault)
    throw new Error('useAnonymousTokenByDefault is true but anonymousToken is missing');

  // TASK: init utils
  Object.assign(utils, {
    storage: new Storage(defaults.storage, defaults.storagePrefix),
    http: Http.create({
      baseURL: defaults.apiUrl
    }),
    detector,
  });
  if (defaults.runSocket) {
    Object.assign(utils, {
      socket: new Socket(defaults.socketUrl)
    });
  }

  // TASK: sets http interceptors for authorization header & refresh tokens
  utils.http.config.interceptors = {
    request: function(req, config, next) {
      if (config.url.indexOf(constants.URLS.token) ===  -1) {
        let user = utils.storage.get('user');
        if (defaults.useAnonymousTokenByDefault && !user) {
          auth.useAnonymousAuth()
            .then(response => {
              config.headers = Object.assign({}, config.headers, utils.storage.get('user').token);
              next({req, config});
            })
        }
        else if (user) {
          config.headers = Object.assign({}, config.headers, user.token);
          next({req, config});
        }
        else {
          next({req, config});
        }
      }
      else {
        next({req, config});
      }
    },
    responseError: function (error, config, resolve, reject, scb, ecb) {
      if (config.url.indexOf(constants.URLS.token) ===  -1
       && defaults.manageRefreshToken
       && error.status === 401
       && error.data && error.data.Message === 'invalid or expired token') {
         auth.__handleRefreshToken__()
           .then(response => {
             resolve(this.request(config, scb, ecb));
           })
           .catch(error => {
             ecb && ecb(error);
             reject(error);
           })
      }
      else {
        ecb && ecb(error);
        reject(error);
      }
    }
  }

  // TASK: clean cache if needed
  let storeUser = utils.storage.get('user');
  if (storeUser && storeUser.token["AnonymousToken"] && (storeUser.token["AnonymousToken"] !== defaults.anonymousToken || !defaults.useAnonymousTokenByDefault)) {
    utils.storage.remove('user');
  }

  // TASK: expose backand namespace to window
  delete backand.init;
  Object.assign(
    backand,
    auth,
    {
      defaults,
      object,
      file,
      query,
      user,
    }
  );
  if(defaults.runSocket) {
    storeUser = utils.storage.get('user');
    storeUser && utils.socket.connect(
      storeUser.token.Authorization || null,
      defaults.anonymousToken,
      defaults.appName
    );
    Object.assign(backand, {on: utils.socket.on.bind(utils.socket)});
  }
  if(defaults.exportUtils) {
    Object.assign(backand, { utils });
  }

}

module.exports = backand
