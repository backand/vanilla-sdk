import { URLS } from './../constants'
import utils from './../utils/utils'

export default {
  get,
  post,
}

function get (name, params = {}) {
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'GET',
    params,
  });
}
function post (name, data, params = {}) {
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'POST',
    data,
    params,
  });
}
