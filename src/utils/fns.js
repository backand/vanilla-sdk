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

export function __dispatchEvent__ (name, data = {}) {
  let event;
  if(defaults.isMobile || utils.detector.env === 'node')
    return;
  if (document.createEvent) {
    event = document.createEvent('Event');
    event.initEvent(name, true, true);
    event.eventName = name;
    event.data = data;
    window.dispatchEvent(event);
  }
  else if (document.createEventObject) {
    event = document.createEventObject();
    event.eventType = name;
    event.eventName = name;
    event.data = data;
    window.fireEvent('on' + event.eventType, event);
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
