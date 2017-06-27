class Http {
  constructor(config = {}) {
    if (!XMLHttpRequest)
      throw new Error('XMLHttpRequest is not supported by this platform');

    this.defaults = Object.assign({
      // url: '/',
      method: 'GET',
      headers: {},
      params: {},
      interceptors: {},
      withCredentials: false,
      responseType: 'json',
      timeout: 0,
      auth: {
        username: null,
        password: null
      }
    }, config);
  }

  _getHeaders(headers) {
    return headers.split('\r\n').filter(header => header).map(header => {
      let jheader = {}
      let parts = header.split(':');
      jheader[parts[0]] = parts[1]
      return jheader;
    });
  }

  _getData(type, data) {
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

  _createResponse(req, config) {
    return {
      status: req.status,
      statusText: req.statusText,
      headers: this._getHeaders(req.getAllResponseHeaders()),
      config,
      data: this._getData(req.getResponseHeader("Content-Type"), req.responseText),
    }
  }

  _handleError(data, config) {
    return {
      status: 0,
      statusText: 'ERROR',
      headers: [],
      config,
      data,
    }
  }

  _encodeParams(params) {
    let paramsArr = [], i, v, e, objValue;
    console.log(params);
    for (let param in params) {
      let val = params[param];
      if (Array.isArray(val)) {
        for (i = 0; i < val.length; i++) {
          if(typeof val[i] === 'object'){
            for (v in val[i]) {
              val[i][v] = encodeURIComponent(val[i][v]);
            }
          }
        }
        val = JSON.stringify(val);
      }
      else if (typeof val === 'object') {
        for (objValue in val) {
          val[objValue] = encodeURIComponent(val[objValue]);
        }
        val = JSON.stringify(val);
      }
      else {
        val = encodeURIComponent(val);
      }
      paramsArr.push(param + '=' + encodeURIComponent(val));
    }
    return paramsArr.join('&');
  }

  _setHeaders(req, headers) {
    for (let header in headers) {
      req.setRequestHeader(header, headers[header]);
    }
  }

  _setData(req, data) {
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

  request(cfg = {}) {
    return new Promise((resolve, reject) => {

      let config = Object.assign({}, this.defaults, cfg);
      if (!config.url || typeof config.url !== 'string' || config.url.length === 0) {
        reject(this._handleError('url parameter is missing', config));
      }
      if (config.interceptors.request) {
        resolve(config.interceptors.request(config));
      }
      else {
        resolve(config);
      }
    }).then((config) => {
      return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        let params = this._encodeParams(config.params);
        console.log(params);
        req.open(config.method, `${config.baseURL ? config.baseURL + '/' : ''}${config.url}${params ? '?' + params : ''}`, true, config.auth.username, config.auth.password);
        req.withCredentials = config.withCredentials || false;
        req.timeout = config.timeout || 0;
        req.ontimeout = () => {
          reject(this._handleError('timeout', config));
        };
        req.onabort = () => {
          reject(this._handleError('abort', config));
        };
        req.onreadystatechange = () => {
          let _DONE = XMLHttpRequest.DONE || 4;
          if (req.readyState == _DONE) {
            let res = this._createResponse(req, config);
            if (res.status === 200) {
              if (config.interceptors.response) {
                resolve(config.interceptors.response(res));
              }
              else {
                resolve(res);
              }
            }
            else {
              if (config.interceptors.responseError) {
                resolve(config.interceptors.responseError(res));
              }
              else {
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
  instance.config = context.defaults;
  return instance;
}

var http = createInstance();
http.create = (config) => {
  return createInstance(config);
};

export default http;