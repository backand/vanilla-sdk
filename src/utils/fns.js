export function __generateFakeResponse__ (status = 0, statusText = '', headers = {}, data = '', config = {}) {
  return {
    status,
    statusText,
    headers,
    data,
    config,
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
