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
