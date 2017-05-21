import { URLS } from './../constants'
import utils from './../utils/utils'

export default {
  general
}

function general (data) {
  return utils.http({
    url: `${URLS.bulk}`,
    method: 'POST',
    data,
  });
}
