import { URLS } from './../constants'
import utils from './../utils/utils'

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
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'GET',
    params,
  });
}
function post (name, parameters) {
  const params = {};
  if(parameters) {
    params.parameters = parameters;
  }
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'POST',
    data: params,
  });
}
