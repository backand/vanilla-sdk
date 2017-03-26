import { URLS } from './../constants'
import defaults from './../defaults'
import utils from './../utils/utils'
import { __generateFakeResponse__, hash, __cacheData__, __queueRequest__ } from './../utils/fns'

export default {
  get,
  post,
}

function get (name, parameters) {
  console.warn('NOTE: this method will be deprecated soon. please use backand.query.post instead');
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  const key = hash('query.get' + name + JSON.stringify(params));
  if(!utils.offline || !defaults.runOffline) {
    return utils.http({
      url: `${URLS.query}/${name}`,
      method: 'GET',
      params,
    }).then(response => {
      __cacheData__(key, response);
      return response;
    });
  }
  else {
    return Promise.resolve(utils.storage.get('cache')[key] || __generateFakeResponse__(200, 'OK', {}, {}, {}));
  }
}
function post (name, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  const key = hash('query.post' + name + JSON.stringify(params));
  if(!utils.offline || !defaults.runOffline) {
    return utils.http({
      url: `${URLS.query}/${name}`,
      method: 'POST',
      params,
    }).then(response => {
      __cacheData__(key, response);
      return response;
    });
  }
  else {
    return Promise.resolve(utils.storage.get('cache')[key] || __generateFakeResponse__(200, 'OK', {}, {}, {}));
  }
}
