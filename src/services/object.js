import { URLS } from './../constants'
import utils from './../utils/utils'

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
function getList (object, params = {}, scb, ecb) {
  const allowedParams = ['pageSize','pageNumber','filter','sort','search','exclude','deep','relatedObjects'];
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'GET',
    params: __allowedParams__(allowedParams, params),
  }, null, ecb)
    .then(response => {
      let totalRows = response.data['totalRows'];
      response.data = response.data['data'];
      scb && scb(response, totalRows);
      return response;
    });
}
function create (object, data, params = {}, scb, ecb) {
  const allowedParams = ['returnObject','deep'];
  return utils.http({
    url: `${URLS.objects}/${object}`,
    method: 'POST',
    data,
    params: __allowedParams__(allowedParams, params),
  }, scb, ecb)
}
function getOne (object, id, params = {}, scb, ecb) {
  const allowedParams = ['deep','exclude','level'];
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'GET',
    params: __allowedParams__(allowedParams, params),
  }, scb, ecb)
}
function update (object, id, data, params = {}, scb, ecb) {
  const allowedParams = ['returnObject','deep'];
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'PUT',
    data,
    params: __allowedParams__(allowedParams, params),
  }, scb, ecb)
}
function remove (object, id, scb, ecb) {
  return utils.http({
    url: `${URLS.objects}/${object}/${id}`,
    method: 'DELETE',
  }, scb, ecb)
}

function get (object, action, params = {}, scb, ecb) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${action}`,
    method: 'GET',
    params,
  }, scb, ecb)
}
function post (object, action, data, params = {}, scb, ecb) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${action}`,
    method: 'POST',
    data,
    params,
  }, scb, ecb)
}
