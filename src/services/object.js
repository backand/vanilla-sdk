import { URLS } from './../constants'
import defaults from './../defaults'
import utils from './../utils/utils'
import { __generateFakeResponse__, __dispatchEvent__, hash, __cacheData__, __deleteCacheData__, __queueRequest__ } from './../utils/fns'

export default {
  getList,
  getOne,
  create,
  update,
  remove,
  action: {
    get,
    post,
  },
}

function __allowedParams__ (allowedParams, params) {
  let newParams = {};
  for (let param in params) {
    if (allowedParams.indexOf(param) != -1) {
      newParams[param] = params[param];
    }
  }
  return newParams;
}
function getList (object, options = {}) {
  const params = __allowedParams__(['pageSize','pageNumber','filter','sort','search','exclude','deep','relatedObjects'], options);
  const key = hash('getList' + object + JSON.stringify(params));
  if(!utils.offline || !defaults.runOffline) {
    return utils.http({
      url: `${URLS.objects}/${object}`,
      method: 'GET',
      params,
    }).then(response => {
      // fix response.data.data
      if(response.data['relatedObjects']) { response.relatedObjects = response.data['relatedObjects']; }
      response.totalRows = response.data['totalRows'];
      response.data = response.data['data'];
      // end fix
      __cacheData__(key, response);
      return response;
    });
  }
  else {
    return Promise.resolve(utils.storage.get('cache')[key] || __generateFakeResponse__(200, 'OK', {}, [], {}));
  }
}
function getOne (object, id, options = {}) {
  const params = __allowedParams__(['deep','exclude','level'], options);
  const key = hash('getOne' + object + id);
  if(!utils.offline || !defaults.runOffline) {
    return utils.http({
      url: `${URLS.objects}/${object}/${id}`,
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
function create (object, data, options = {}, parameters) {
  const params = __allowedParams__(['returnObject','deep'], options);
  if(parameters) {
    params.parameters = parameters;
  }
  const request = {
    url: `${URLS.objects}/${object}`,
    method: 'POST',
    data,
    params,
  };
  if(!utils.offline || !defaults.runOffline) {
    return utils.http(request);
  }
  else {
    __queueRequest__({
      action: 'create',
      params: [object, data, options, parameters],
      payload: request,
    });
    return Promise.resolve(__generateFakeResponse__(1, 'QUEUE', {}, {}, {}));
  }
}
function update (object, id, data, options = {}, parameters) {
  const params = __allowedParams__(['returnObject','deep'], options);
  if(parameters) {
    params.parameters = parameters;
  }
  const request = {
    url: `${URLS.objects}/${object}/${id}`,
    method: 'PUT',
    data,
    params,
  };
  if(!utils.offline || !defaults.runOffline || !defaults.allowUpdatesinOfflineMode) {
    return utils.http(request).then(response => {
      __deleteCacheData__(hash('getOne' + object + id));
      return response;
    });
  }
  else {
    __queueRequest__({
      action: 'update',
      params: [object, id, data, options, parameters],
      payload: request,
    });
    return Promise.resolve(__generateFakeResponse__(1, 'QUEUE', {}, {}, {}));
  }
}
function remove (object, id, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  const request = {
    url: `${URLS.objects}/${object}/${id}`,
    method: 'DELETE',
    params
  };
  if(!utils.offline || !defaults.runOffline || !defaults.allowUpdatesinOfflineMode) {
    return utils.http(request).then(response => {
      __deleteCacheData__(hash('getOne' + object + id));
      return response;
    });
  }
  else {
    __queueRequest__({
      action: 'remove',
      params: [object, id, parameters],
      payload: request,
    });
    return Promise.resolve(__generateFakeResponse__(1, 'QUEUE', {}, {}, {}));
  }
}

function get (object, action, parameters) {
  const params = {
    name: action
  };
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.objectsAction}/${object}`,
    method: 'GET',
    params,
  });
}
function post (object, action, data, parameters) {
  const params = {
    name: action
  };
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.objectsAction}/${object}`,
    method: 'POST',
    data,
    params,
  });
}
