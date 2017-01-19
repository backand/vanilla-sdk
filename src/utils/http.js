class Http {
  constructor (config = {}) {
    if (!window.XMLHttpRequest)
      throw new Error('XMLHttpRequest is not supported by this platform');

    this.config = Object.assign({
      // url: '/',
      method: 'GET',
      headers: {},
      params: {},
      interceptors: {},
      withCredentials: false,
      responseType: 'json',
      // timeout: null,
      auth: {
       username: null,
       password: null
      }
    }, config)
  }
  _getHeaders (headers) {
    return headers.split('\r\n').filter(header => header).map(header => {
      let jheader = {}
      let parts = header.split(':');
      jheader[parts[0]] = parts[1]
      return jheader;
    });
  }
  _getData (type, data) {
    if (!type) {
      return data;
    }
    else if (type.indexOf('json') === -1) {
      return data;
    }
    else {
      return JSON.parse(data);
    }
  }
  _createResponse (req, config) {
    return {
      status: req.status,
      statusText: req.statusText,
      headers: this._getHeaders(req.getAllResponseHeaders()),
      config,
      data: this._getData(req.getResponseHeader("Content-Type"), req.responseText),
    }
  }
  _handleError (data, config) {
    return {
      status: 0,
      statusText: 'ERROR',
      headers: [],
      config,
      data,
    }
  }
  _encodeParams (params) {
    let paramsArr = [];
    for (let param in params) {
      let val = params[param];
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      paramsArr.push(`${param}=${encodeURIComponent(val)}`)
    }
    return paramsArr.join('&');
  }
  _setHeaders (req, headers) {
    for (let header in headers) {
      req.setRequestHeader(header, headers[header]);
    }
  }
  _setData (req, data) {
    if (!data) {
      req.send();
    }
    else if (typeof data != 'object') {
      req.send(data);
    }
    else {
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify(data));
    }
  }
  request (cfg, scb, ecb) {
    return new Promise(resolve => {
      let req = new XMLHttpRequest();
      let config = Object.assign({}, this.config, cfg);
      if (config.interceptors.request) {
        config.interceptors.request.call(this, req, config, resolve);
      }
      else {
        resolve({req, config});
      }
    }).then(({req, config}) => {
        return new Promise((resolve, reject) => {
          if (!config.url || typeof config.url !== 'string' || config.url.length === 0) {
            let res = this._handleError('url parameter is missing', config);
            ecb && ecb(res);
            reject(res);
          }
          if (config.withCredentials) { req.withCredentials = true }
          if (config.timeout) { req.timeout = true }
          let params = this._encodeParams(config.params);
          req.open(config.method, `${config.baseURL ? config.baseURL+'/' : ''}${config.url}${params ? '?'+params : ''}`, true, config.auth.username, config.auth.password);
          req.ontimeout = () => {
            let res = this._handleError('timeout', config);
            ecb && ecb(res);
            reject(res);
          };
          req.onabort = () => {
            let res = this._handleError('abort', config);
            ecb && ecb(res);
            reject(res);
          };
          req.onreadystatechange = () => {
            let _DONE = XMLHttpRequest.DONE || 4;
            if (req.readyState == _DONE) {
              let res = this._createResponse(req, config);
              if (res.status === 200){
                if (config.interceptors.response) {
                  config.interceptors.response.call(this, res, config, resolve, reject, scb, ecb);
                }
                else {
                  scb && scb(res);
                  resolve(res);
                }
              }
              else {
                if (config.interceptors.responseError) {
                  config.interceptors.responseError.call(this, res, config, resolve, reject, scb, ecb);
                }
                else {
                  ecb && ecb(res);
                  reject(res);
                }
              }
            }
          }
          this._setHeaders(req, config.headers);
          this._setData(req, config.data);
        });
    });
  }
}
function createInstance(config = {}) {
  var context = new Http(config);
  var instance = (...args) => Http.prototype.request.apply(context, args);
  instance.config = context.config;
  return instance;
}

var http = createInstance();
http.create = (config) => {
  return createInstance(config);
};

export default http;
