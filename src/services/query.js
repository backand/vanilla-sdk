import { URLS } from './../constants'
import utils from './../utils/utils'

export default {
  get,
  post,
}

function get (name, params = {}, scb, ecb) {
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'GET',
    params,
  }, scb, ecb)
}
function post (name, data, params = {}, scb, ecb) {
  return utils.http({
    url: `${URLS.query}/${name}`,
    method: 'POST',
    data,
    params,
  }, scb, ecb)
}
