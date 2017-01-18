import { URLS } from './../constants'
import utils from './../utils/utils'

export default {
  upload,
  remove,
}

function upload (object, fileAction, filename, filedata, scb, ecb) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${fileAction}`,
    method: 'POST',
    data: {
        filename,
        filedata: filedata.substr(filedata.indexOf(',') + 1, filedata.length)
      }
  }, scb, ecb)
}
function remove (object, fileAction, filename, scb, ecb) {
  return utils.http({
    url: `${URLS.objectsAction}/${object}?name=${fileAction}`,
    method: 'DELETE',
    data: {
        filename,
      }
  }, scb, ecb)
}
