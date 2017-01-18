vanilla-sdk
===
[![npm version](https://img.shields.io/npm/v/@backand/vanilla-sdk.svg?style=flat-square)](https://www.npmjs.org/package/@backand/vanilla-sdk)
[![npm downloads](https://img.shields.io/npm/dt/@backand/vanilla-sdk.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@backand/vanilla-sdk)

>  Backand SDK for JavaScript.
This SDK enables you to communicate comfortably and quickly with your Backand app.
It requires zero configurations, no installations and no requirements.


## Installation
- npm:
```bash
$ npm i -S @backand/vanilla-sdk
```
- yarn:
```bash
$ yarn add @backand/vanilla-sdk
```
- download/clone:
```bash
$ git clone https://github.com/backand/vanilla-sdk.git
```

## Import
- bundlers:
```javascript
import backand from '@backand/vanilla-sdk'
const backand = require('@backand/vanilla-sdk')
```
-  index.html:
``` html
<script src="node_modules/@backand/vanilla-sdk/dist/backand.min.js"></script>
<script src="backand.min.js"></script>
```

## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 10+ ✔ |


## Quick Start
```javascript
backand.init({
  appName: 'APP_NAME',
  anonymousToken: 'ANONYMOUS_TOKEN'
});

backand.object.getList('users')
  .then((response) => {
      console.log(response);
  })
  .catch(function(error){
      console.log(error);
  });
```


## API

### backand.init():
Creates a new backand instance with the supplied configurations.
```javascript
backand.init(config);
```
config:
- **appName** - Sets the name of your backand app (String) *required*
- **anonymousToken** - Sets the anonymous token of your backand app (String) *required*
- **useAnonymousTokenByDefault** - Determines whether the sdk should use the anonymousToken when there is no other token (Boolean) (Default: true) *optional*
- **signUpToken** - Sets the signup token of your backand app (String) *optional*
- **apiUrl** - Sets the API url of backand servers (String) (Default: 'https://api.backand.com') *optional*
- **storage** - Sets the storage type to use (local/session/implementation of StorageAbstract) (Object) (Default: localStorage) *optional*
- **storagePrefix** - Sets prefix to use at the storage (String) (Default: 'BACKAND_') *optional*
- **manageRefreshToken** - Determines whether the sdk should manage refresh tokens internally (Boolean) (Default: true) *optional*
- **runSigninAfterSignup** - Determines whether the sdk should run signin after signup automatically (Boolean) (Default: true) *optional*
- **runSocket** - Determines whether the sdk should run socket automatically (socketio-client required) (Boolean) (Default: false) *optional*
- **socketUrl** - Sets the socket url of backand servers (String) (Default: 'https://socket.backand.com') *optional*
- **isMobile** - Determines whether the sdk is part of a mobile application (Boolean) (Default: false) *optional*
- **mobilePlatform** - sets the platform used to build the mobile application ('ionic'/'react-native') (String) (Default: 'ionic') *optional*

### Properties:
| Name                | Description                                                                                                                                                           |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| constants           | EVENTS, URLS, SOCIALS                                                                                                                                                 |
| helpers             | filter, sort, exclude, StorageAbstract                                                                                                                                |
| direct props (auth) | useAnonymousAuth, signin, signup, socialSignin, socialSigninWithToken, socialSignup, requestResetPassword, resetPassword, changePassword, signout, getSocialProviders |
| defaults            | the configurations of your app                                                                                                                                        |
| object              | getList, create, getOne, update, remove, action: { get ,post }                                                                                                        |
| file                | upload, remove                                                                                                                                                        |
| query               | get, post                                                                                                                                                             |
| user                | getUserDetails, getUsername, getUserRole, getToken, getRefreshToken                                                                                                   |
| on                  | the socket.on function                                                                                                                                                |


### Events:
| Name    | Description           | Syntax                                                                     |
|---------|-----------------------|----------------------------------------------------------------------------|
| SIGNIN  | dispatched on signin  | window.addEventListener(backand.constants.EVENTS.SIGNIN, (e)=>{}, false);  |
| SIGNOUT | dispatched on signout | window.addEventListener(backand.constants.EVENTS.SIGNOUT, (e)=>{}, false); |
| SIGNUP  | dispatched on signup  | window.addEventListener(backand.constants.EVENTS.SIGNUP, (e)=>{}, false);  |


### Methods:
**NOTE:**
- **scb == Success Callback, ecb == Error Callback**
- **scb, ecb are optional parameters**
- **All Methods return Promise -> .then() .catch() are available**
- **The final response of each method, including errors is an object with the following attributs: { status, statusText, headers, config, data }**

#### Authentication:
##### Signin
Signin with username and password in order to get access_token to be used in all other calls. If you don't have users you should use anonymous token only.
```javascript
backand.signin(username, password, scb, ecb)
  .then(res => {
    console.log('signin succeeded with user:' + res.data.username);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Signup
Creates a new user in your app. in signup you must provide the basic details of username email, first name, last name and password:
```javascript
backand.signup(firstName, lastName, email, password, confirmPassword, parameters = {}, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Change Password
Changes the password of the current user:
```javascript
backand.changePassword(oldPassword, newPassword, scb, ecb)
  .then(res => {
    console.log('Password changed');
  })
  .catch(err => {
    console.log(err);
  });
```
#### Social Authentication:
##### Signin / Signup
For social, just call sign-in and by default the user will be signed up if needed. The app opens a dialog supplied by the social network.
you can get the provider list from `backand.getSocialProviders(scb)` method.
```javascript
backand.socialSignin(provider, scb, ecb)
  .then(res => {
    console.log('signin succeeded with user:' + res.data.username);
  })
  .catch(err => {
    console.log(err);
  });
```

#### CRUD:
Fetch, create, update, remove and filter rows, from an Backand object.
##### GetList
```javascript
backand.object.getList(object, params, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
##### GetList with params
```javascript
let params = {
  sort: backand.helpers.sort.create('creationDate', backand.helpers.sort.orders.desc),
  exclude: backand.helpers.exclude.options.all,
  filter = backand.helpers.filter.create('user', backand.helpers.filter.operators.relation.in, userId),
  pageSize: 1000000,
  pageNumber: 1,
}
backand.object.getList(object, params, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
##### GetOne
```javascript
backand.object.getOne(object, id, params, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Create
```javascript
backand.object.create(object, data, params, scb, ecb)
  .then(res => {
    console.log('object created');
  })
  .catch(err => {
    console.log(err);
  });
```
##### Update
```javascript
backand.object.update(object, id, data, params, scb, ecb)
  .then(res => {
    console.log('object updated');
  })
  .catch(err => {
    console.log(err);
  });
```
##### Remove
```javascript
backand.object.remove(object, id, scb, ecb)
  .then(res => {
    console.log('object removed');
  })
  .catch(err => {
    console.log(err);
  });
```
##### Trigger object actions
```javascript
backand.object.action.get(object, action, params, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

#### Socket:
Subscribe to events from the server via sockets. Socket signin and signout are done automatically.
##### On
```javascript
backand.on(eventName, data => {
  console.log(eventName + 'has been dispatched');
});
```

#### Files:
After you created a server side action in Backand (object -> actions tab -> Backand Files icon -> name: 'files')
##### Upload
```javascript
backand.file.upload(object, 'files', filename, filedata, scb, ecb)
  .then(res => {
    console.log('file uploaded. url: ' + res.data.url);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Remove
```javascript
backand.file.remove(object, 'files', filename, scb, ecb)
  .then(res => {
    console.log('file deleted');
  })
  .catch(err => {
    console.log(err);
  });
```

#### User:
Return data about the connected user (getUserDetails, getUsername, getUserRole, getToken, getRefreshToken).

##### GetUserDetails
Gets the connect user details. The 'force' parameter cause it to fetch data from server (default: false).
```javascript
backand.user.getUserDetails(force, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

#### Query:
Runs your query at Backand (get/post).
##### Get
```javascript
backand.query.get(name, params, scb, ecb)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```


## Examples
***To view the demo web page, just run npm start - [example page](https://github.com/backand/vanilla-sdk/blob/master/example/).***


## License

  [MIT](LICENSE)
