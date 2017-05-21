import defaults from './defaults'
import * as constants from './constants'
import * as helpers from './helpers'

import utils from './utils/utils'
import Storage from './utils/storage'
import Http from './utils/http'
import interceptors from './utils/interceptors'
import Socket from './utils/socket'
import detect from './utils/detector'
import { __dispatchEvent__, __generateFakeResponse__ } from './utils/fns'

import auth from './services/auth'
import object from './services/object'
import file from './services/file'
import query from './services/query'
import offline from './services/offline'
import user from './services/user'
import analytics from './services/analytics'

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
    offline: !navigator.onLine,
    forceOffline: false,
    offlineAt: null,
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

  // TASK: set offline events
  function afterProcessReq(request, response) {
    defaults.afterExecuteOfflineItem(response, request.payload);
    return processReqs(utils.storage.get('queue'));
  }

  function processReqs(requests) {
    if(utils.offline) {
      // When enter offline mode during the process
      return;
    }
    let request = requests.shift();
    utils.storage.set('queue', requests);
    if(!request) {
      return;
    }
    if(defaults.beforeExecuteOfflineItem(request.payload)) {
      if(request.action === 'create') {
        object[request.action].apply(null, request.params)
          .then(afterProcessReq.bind(null, request)).catch(afterProcessReq.bind(null, request));
      }
      else {
        object.getOne(request.params[0], request.params[1]).then((response) => {
          if(!response.data.updatedAt) {
            return Promise.reject(__generateFakeResponse__(0, '', {}, 'Cannot update this object, object is missing updatedAt property', {}));
          }
          if(new Date(response.data.updatedAt) > utils.offlineAt) {
            return Promise.reject(__generateFakeResponse__(0, '', {}, 'Cannot update this object, object was updated after you entered offline mode', {}));
          }
          return object[request.action].apply(null, request.params);
        }).then(afterProcessReq.bind(null, request)).catch(afterProcessReq.bind(null, request));
      }
    }
    else {
      return processReqs(utils.storage.get('queue'));
    }
  }
  function __updateOnlineStatus__(event) {
    if(utils.offline) {
      utils.offlineAt = new Date();
      __dispatchEvent__('startOfflineMode');
      console.info('SDK started offline mode')
    }
    else {
      __dispatchEvent__('endOfflineMode');
      console.info('SDK finished offline mode');
      processReqs(utils.storage.get('queue'));
    }
  }
  if (defaults.runOffline && utils.detector.env === 'browser') {
    window.addEventListener('online',  __updateOnlineStatus__);
    window.addEventListener('offline', __updateOnlineStatus__);
  }
  // TASK: set offline storage
  if (defaults.runOffline) {
    if (!utils.storage.get('cache')) {
      utils.storage.set('cache', {});
    }
    if (!utils.storage.get('queue')) {
      utils.storage.set('queue', []);
    }
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
      offline,
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
