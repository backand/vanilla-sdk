import { URLS } from './../constants'
import utils from './../utils/utils'

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
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'GET',
    params,
  })
  .then(response => {
    if(response.data['relatedObjects']) { response.relatedObjects = response.data['relatedObjects']; }
    response.totalRows = response.data['totalRows'];
    response.data = response.data['data'];
    return response;
  });
}
function getOne (object, id, options = {}) {
  const params = __allowedParams__(['deep','exclude','level'], options);
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'GET',
    params,
  });
}
function create (object, data, options = {}, parameters) {
  const params = __allowedParams__(['returnObject','deep'], options);
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'POST',
    data,
    params,
  });
}
function update (object, id, data, options = {}, parameters) {
  const params = __allowedParams__(['returnObject','deep'], options);
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'PUT',
    data,
    params,
  });
}
function remove (object, id, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'DELETE',
    params
  });
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
