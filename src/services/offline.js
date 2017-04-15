import utils from './../utils/utils'
import { __dispatchEvent__ } from './../utils/fns'

export default {
  forcOffline,
  get cache() {
    return utils.storage.get('cache');
  },
  set cache(obj) {
    if(typeof obj !== 'object') {
      throw new Error('cache must be an object of {hash: data} pairs.');
    }
    utils.storage.set('cache', obj);
  },
  get queue() {
    return utils.storage.get('queue');
  },
  set queue(arr) {
    if(!Array.isArray(arr)) {
      throw new Error('queue must be an array of requestDescriptor objects.');
    }
    utils.storage.set('cache', arr);
  },
}

function forcOffline (force = true) {
  if(force) {
    utils.offline = true;
    utils.forcOffline = true;
    __dispatchEvent__('offline')
  }
  else {
    utils.offline = !navigator.onLine;
    utils.forcOffline = false;
    __dispatchEvent__('online');
  }
}
