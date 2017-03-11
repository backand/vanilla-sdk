import { URLS } from './../constants'
import defaults from './../defaults'
import utils from './../utils/utils'
import { __generateFakeResponse__, __dispatchEvent__, hash } from './../utils/fns'

export default {
  getList,
  create,
  getOne,
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
function getList (object, params = {}) {
  const allowedParams = __allowedParams__(['pageSize','pageNumber','filter','sort','search','exclude','deep','relatedObjects'], params);
  const key = hash(object + JSON.stringify(allowedParams));
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'GET',
    params: allowedParams,
  })
  .then(response => {
    if(response.data['relatedObjects']) { response.relatedObjects = response.data['relatedObjects']; }
    response.totalRows = response.data['totalRows'];
    response.data = response.data['data'];

    // offline
    if(defaults.forcOffline) {
      return Promise.reject('forcOffline');
    }
    let c = {};
    c[key] = response;
    utils.storage.set('cache', Object.assign(utils.storage.get('cache'), c));

    return response;
  })
  .catch(err => {
    if(!utils.offline) {
      return Promise.reject(__generateFakeResponse__(0, '', {}, err, {}));
    }
    else {
      return Promise.resolve(utils.storage.get('cache')[key] || __generateFakeResponse__(200, 'OK', {}, [], {}));
    }
  });
}
function create (object, data, params = {}) {
  const allowedParams = ['returnObject','deep'];
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'POST',
    data,
    params: __allowedParams__(allowedParams, params),
  });
}
function getOne (object, id, params = {}) {
  const allowedParams = ['deep','exclude','level'];
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'GET',
    params: __allowedParams__(allowedParams, params),
  });
}
function update (object, id, data, params = {}) {
  const allowedParams = ['returnObject','deep'];
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'PUT',
    data,
    params: __allowedParams__(allowedParams, params),
  });
}
function remove (object, id) {
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'DELETE',
  });
}

function get (object, action, params = {}) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${action}`,
    method: 'GET',
    params,
  });
}
function post (object, action, data, params = {}) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${action}`,
    method: 'POST',
    data,
    params,
  });
}
