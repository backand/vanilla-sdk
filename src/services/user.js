import { URLS } from './../constants'
import utils from './../utils/utils'
import { __generateFakeResponse__ } from './../utils/fns'

export default {
  getUserDetails,
  getUsername,
  getUserRole,
  getToken,
  getRefreshToken,
}

function __getUserDetailsFromStorage__ () {
  return new Promise((resolve, reject) => {
    let user = utils.storage.get('user');
    if (!user) {
      reject(__generateFakeResponse__(0, '', {}, 'No cached user found. authentication is required.', {}));
    }
    else {
      resolve(__generateFakeResponse__(200, 'OK', {}, user.details, {}));
    }
  });
}
function getUserDetails (force = false) {
  if (!force) {
    return __getUserDetailsFromStorage__();
  }
  else {
    return utils.http({
      url: URLS.profile,
      method: 'GET',
    })
    .then(response => {
      let user = utils.storage.get('user');
      let newDetails = response.data;
      utils.storage.set('user', {
        token: user.token,
        details: Object.assign({}, user.details, newDetails)
      });
      return __getUserDetailsFromStorage__();
    });
  }
}
function getUsername () {
  return __getUserDetailsFromStorage__()
  .then(response => {
    response.data = response.data['username'];
    return response;
  });
}
function getUserRole () {
  return __getUserDetailsFromStorage__()
  .then(response => {
    response.data = response.data['role'];
    return response;
  });
}
function getToken () {
  return __getUserDetailsFromStorage__()
  .then(response => {
    response.data = response.data['access_token'];
    return response;
  });
}
function getRefreshToken () {
  return __getUserDetailsFromStorage__()
  .then(response => {
    response.data = response.data['refresh_token'];
    return response;
  });
}
