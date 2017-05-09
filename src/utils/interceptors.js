import utils from './utils'
import { __generateFakeResponse__ } from './fns'
import defaults from './../defaults'
import * as constants from './../constants'
import auth from './../services/auth'

export default {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor
}

export function requestInterceptor (config) {
  if (utils.forceOffline) {
    return Promise.reject(__generateFakeResponse__(0, '', {}, 'networkError (forceOffline is enabled).', {}));
  }
  if (config.url.indexOf(constants.URLS.token) === -1) {
    let user = utils.storage.get('user');
    if (defaults.useAnonymousTokenByDefault && !user) {
      return auth.useAnonymousAuth()
      .then(response => {
        config.headers = Object.assign({}, config.headers, utils.storage.get('user').token);
        return config;
      });
    }
    else if (user) {
      config.headers = Object.assign({}, config.headers, user.token);
      return config;
    }
    else {
      return config;
    }
  }
  else {
    return config;
  }
}

export function requestErrorInterceptor (error) {
  return Promise.reject(error);
}

export function responseInterceptor (response) {
  return response;
}

export function responseErrorInterceptor (error) {
  if (error.config.url.indexOf(constants.URLS.token) ===  -1
   && defaults.manageRefreshToken
   && error.status === 401
   && error.data && error.data.Message === 'invalid or expired token') {
     return auth.__handleRefreshToken__()
     .then(response => {
       return utils.http(error.config);
     })
     .catch(error => {
       return Promise.reject(error);
     })
  }
  else {
    return Promise.reject(error);
  }
}
