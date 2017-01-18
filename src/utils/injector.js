class Injector {
  constructor () {
    this.dependencies = {};
    this.cached = [];
  }
  register (key, value) {
    this.dependencies[key] = value;
  }
  resolve (deps, func, scope = {}) {
    var d;
    for(var i=0; i<deps.length, d=deps[i]; i++) {
      if(this.dependencies[d]) {
        scope[d] = this.dependencies[d];
      }
      else {
        throw new Error('Can\'t resolve ' + d);
      }
    }
    return function() {
      return func.apply(scope || {}, Array.prototype.slice.call(arguments, 0));
    }
  }
}

export default new Injector();

// import injector from './../utils/injector'

// injector.register('storage', storage);
// injector.register('http', http);
// injector.register('socket', socket);

// export class object {
//   constructor (name) {
//     this.name = name;
//     // this.action = new Action(name);
//   }
//   __allowedParams__ (allowedParams, params) {
//     let newParams = {};
//     for (let param in params) {
//       if (allowedParams.indexOf(param) != -1) {
//         newParams[param] = params[param];
//       }
//     }
//     return newParams;
//   }
//   getList (params = {}, scb, ecb) {
//     const allowedParams = ['pageSize','pageNumber','filter','sort','search','exclude','deep','relatedObjects'];
//     return injector.resolve(['http'], function(allowedParams, params, scb, ecb) {
//       return this.http({
//         url: `${URLS.objects}/${this.name}`,
//         method: 'GET',
//         params: this.__allowedParams__(allowedParams, params),
//       }, scb, ecb)
//     }, this).call(allowedParams, params, scb, ecb);
//   }
// }
