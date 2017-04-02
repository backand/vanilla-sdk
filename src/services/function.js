import { URLS } from './../constants'
import utils from './../utils/utils'

export default {
  get,
  post,
}

function get (name, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.fn}/${name}`,
    method: 'GET',
    params,
  });
}
function post (name, data, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.fn}/${name}`,
    method: 'POST',
    data,
    params,
  });
}
