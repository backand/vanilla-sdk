import utils from './utils'
import defaults from './../defaults'

export function __generateFakeResponse__ (status = 0, statusText = '', headers = {}, data = '', config = {}) {
  return {
    status,
    statusText,
    headers,
    data,
    config,
  }
}

export function __dispatchEvent__ (name, addons = {}) {
  let event;
  if(defaults.isMobile || utils.detector.env === 'node')
    return;
  if (window.CustomEvent) {
    event = new CustomEvent(name);
    event.eventName = name;
    Object.assign(event, addons);
    window.dispatchEvent(event);
  }
  else if (document.createEvent) {
    event = document.createEvent('Event');
    event.initEvent(name, false, false);
    event.eventName = name;
    Object.assign(event, addons);
    window.dispatchEvent(event);
  }
  else if (document.createEventObject) {
    event = document.createEventObject();
    event.eventType = name;
    event.eventName = name;
    Object.assign(event, addons);
    window.fireEvent('on' + event.eventType, event);
  }
}

export function __cacheData__ (key, response) {
  if (defaults.runOffline) {
    let c = {};
    c[key] = response;
    c[key].config = {
      fromCache: true
    }
    utils.storage.set('cache', Object.assign(utils.storage.get('cache'), c));
  }
}

export function __deleteCacheData__ (key) {
  if (defaults.runOffline) {
    let c = utils.storage.get('cache');
    delete c[key];
    utils.storage.set('cache', c);
  }
}

export function __queueRequest__ (request) {
  if (defaults.runOffline) {
    let a = utils.storage.get('queue');
    a.push(request);
    utils.storage.set('queue', a);
  }
}

export function bind (obj, scope) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      bind(obj[key]);
    }
    else if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(scope);
    }
  });
  return obj;
}

export function hash(str) {
  let hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}
