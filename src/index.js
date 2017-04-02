import defaults from './defaults'
import * as constants from './constants'
import * as helpers from './helpers'

import utils from './utils/utils'
import Storage from './utils/storage'
import Http from './utils/http'
import interceptors from './utils/interceptors'
import Socket from './utils/socket'
import detect from './utils/detector'

import auth from './services/auth'
import object from './services/object'
import file from './services/file'
import query from './services/query'
import user from './services/user'
import analytics from './services/analytics'
import fn from './services/function'
import bulk from './services/bulk'

// Task: Polyfills
import { Promise } from 'es6-promise'
(function(local) {
  if (local.Promise) {
   return
 }
  local.Promise = Promise;
})(typeof self !== 'undefined' ? self : new Function('return this')())

// TASK: run tests to identify the runtime environment
var detector = detect();

// TASK: set first defaults base on detector results
defaults["storage"]  = (detector.env === 'browser') ? window.localStorage : new helpers.MemoryStorage();
defaults["isMobile"] = (detector.device === 'mobile' || detector.device === 'tablet');

if(detector.env === 'browser') {
  // TASK: get data from url in social sign-in popup
  if(window.location) {
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

  // TASK: add segment analytics to head tag
  // if(document) {
  //   var script = document.createElement('script');
  //   script.type = 'text/javascript';
  //   script.innerText = analytics;
  //   document.getElementsByTagName('head')[0].appendChild(script);
  // }
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
  if (!defaults.anonymousToken)
    defaults.useAnonymousTokenByDefault = false;

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
    request: interceptors.requestInterceptor,
    response: interceptors.responseInterceptor,
    responseError: interceptors.responseErrorInterceptor,
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
      fn,
      bulk
    }
  );
  if(defaults.runSocket) {
    storeUser = utils.storage.get('user');
    storeUser && utils.socket.connect(
      storeUser.token.Authorization || null,
      defaults.anonymousToken,
      defaults.appName
    );
    Object.assign(backand, {
      on: Socket.prototype.on.bind(utils.socket),
    });
  }
  if(defaults.exportUtils) {
    Object.assign(backand, { utils });
  }

}

module.exports = backand
