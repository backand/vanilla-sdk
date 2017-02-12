vanilla-sdk
===

>  Backand SDK for JavaScript.
This SDK enables you to communicate comfortably and quickly with your Backand app.
It requires zero configurations, no installations and no requirements.

## Overview
Backand's Vanilla SDK is designed for easy integration with plain JavaScript applications, as well as other applications that do not make use of any particular JavaScript framework. If you are working with Angular 1, Angular 2, or Redux, we provide the following wrapper SDKs:

| Platform | SDK link |
| -------- | -------- |
| Angular 1 | https://github.com/backand/angular1-sdk |
| Angular 2 | https://github.com/backand/angular2-sdk |
| Redux | https://github.com/backand/redux-sdk |

If you are not working with the above platforms, you can simply use this SDK directly with any web application - simply include the SDK in your client-side code, then get started!

## Installation

To install the Vanilla SDK, use the correct command for your dependency management platform:

| Provider | Command |
| -------- | ------- |
| npm | `$ npm i -S @backand/vanilla-sdk` |
| yarn | `$ yarn add @backand/vanilla-sdk` |
| bower | `$ bower install backand-vanilla-sdk` |
| clone/download via Git | `$ git clone https://github.com/backand/vanilla-sdk.git` |

## Import

Next, import the SDK into your project. To import in a bundler-based system, use the following JavaScript:

```javascript
import backand from '@backand/vanilla-sdk'
const backand = require('@backand/vanilla-sdk')
```
Otherwise, include the following tags in your `index.html` file:

``` html
<script src="node_modules/@backand/vanilla-sdk/dist/backand.min.js"></script>
<script src="backand.min.js"></script>
```

## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 10+ ✔ |


## Quick Start

Getting started with the SDK is as simple as configuring access to a Back& application, then calling `getList` on a relevant object:

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

This connects your Back& application (with the app name of `APP_NAME` and an anonymous access token of `ANONYMOUS TOKEN`) to your current project. Once the connection is configured, the SDK uses this connection information to construct HTTP requests to your API. Result data is returned in the `response` object as the member variable `data`. In the case of `getList`, this will be a JSON array of objects pulled from the `users` table in your Back& application. You can easily change the table being manipulated by replacing `users` with the name of any object in your system.

## API Reference

### backand.init():

The `init()` method creates a new Back& SDK instance with the supplied configuration.

#### Sample Code
```javascript
var config = {
   appName: 'APP_NAME',
   anonymousToken: 'ANONYMOUS_TOKEN'
             };
backand.init(config);
```
The available parameters for the `config` parameter are:

| Param Name | Data Type | Usage | Required? | Default Value |
| ---------- | --------- | ----- | --------- | ------------- |
| **appName** | string | Sets the name of your backand app | **required** | |
| **anonymousToken** | string | Sets the anonymous token of your backand app | **required** | |
| **useAnonymousTokenByDefault** | boolean | Determines whether the sdk should use the anonymousToken when there is no other token | *optional* | `true` |
| **signUpToken** | string | Sets the signup token of your backand app | *optional* | |
| **apiUrl** | string | Sets the API url of backand servers | *optional* | `https://api.backand.com` |
| **storage** | object | Sets the storage type to use (local/session/implementation of StorageAbstract) | *optional* | `localStorage` |
| **storagePrefix** | string | Sets prefix to use in the storage structure | *optional* | `BACKAND_` |
| **manageRefreshToken** | boolean | Determines whether the sdk should manage refresh tokens internally | *optional* | `true` |
| **runSigninAfterSignup** | boolean | Determines whether the sdk should run signin after signup automatically | *optional* | `true` |
| **runSocket** | boolean | Determines whether the sdk should run socket automatically | *optional* | `false` |
| **socketUrl** | string | Sets the socket url of backand servers | *optional* | `https://socket.backand.com` |
| **isMobile** | boolean | Determines whether the sdk is part of a mobile application | *optional* | `false` |
| **mobilePlatform** | string | sets the platform used to build the mobile application ('ionic'/'react-native') | *optional* | 'ionic' |

### SDK Properties:

Below is a list of the properties offered by the SDK, a description of the functionality handled by that property, and the list of methods provided by that property:

| Name | Methods | Description |
| ---- | ----------- | ------- |
| constants | EVENTS, URLS, SOCIALS | Provides access to constants in the SDK |
| helpers | `filter`, `sort`, `exclude`, `StorageAbstract` | Provides helper methods for working with the SDK |
| direct properties | `useAnonymousAuth`, `signin`, `signup`, `socialSignin`, `socialSigninWithToken`, `socialSignup`, `requestResetPassword`, `resetPassword`, `changePassword`, `signout`, `getSocialProviders` | These are properties available directly on the Backand SDK object, mostly focused on Authentication |
| defaults | *none* | This stores the current app's configuration in the SDK |
| object | `getList`, `create`, `getOne`, `update`, `remove`, `get` (action), `post` (action) | This encapsulates all methods used to manipulate objects |
| file | `upload`, `remove` | Provides helper methods for working with files |
| query | `get`, `post` | Allows you to work with custom query objects |
| user | `getUserDetails`, `getUsername`, `getUserRole`, `getToken`, `getRefreshToken` | Provides information on the current authenticated user |
| on | *none* | This is the event handler for socket.io functions, replacing socket.on |

### Default Events:
By default, the Back& SDK emits the following events that your code can respond to:

| Name    | Description           | Syntax                                                                     |
|---------|-----------------------|----------------------------------------------------------------------------|
| SIGNIN  | dispatched on signin  | window.addEventListener(backand.constants.EVENTS.SIGNIN, (e)=>{}, false);  |
| SIGNOUT | dispatched on signout | window.addEventListener(backand.constants.EVENTS.SIGNOUT, (e)=>{}, false); |
| SIGNUP  | dispatched on signup  | window.addEventListener(backand.constants.EVENTS.SIGNUP, (e)=>{}, false);  |


### SDK Methods:
**NOTE:**
- **All Methods return a Promise -> you can work with the response using .then() and .catch()**
- **You can see the response schema [here](https://github.com/mzabriskie/axios#response-schema)**

#### Authentication:

Authentication methods are called directly on the SDK, without any properties: `backand.signin(username, password)`

##### Signin

Signin with username and password in order to get access_token to be used in all other calls. If you don't have users you should use anonymous token only.

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| username | string | the username to authenticate |
| password | string | the user's password |

###### Sample Code
```javascript
backand.signin(username, password)
  .then(res => {
    console.log('signin succeeded with user:' + res.data.username);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Signup
Creates a new user in your app. in signup you must provide the basic details of username email, first name, last name and password

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| firstName | string | the user's first name |
| lastName | string | the user's last name |
| email | string | the user's email |
| password | string | the user's password |
| confirmPassword | string | the value entered by the user when asked to confirm the password during registration |
| parameters | object | An object containing information for any paremeters to the signup call. This allows you to set additional info on the user object at registration time |

###### Sample Code
```javascript
backand.signup(firstName, lastName, email, password, confirmPassword, parameters = {})
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```
##### Change Password
Changes the password of the current user

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| oldPassword | string | the user's old password |
| newPassword | string | the user's desired new password |

###### Sample Code
```javascript
backand.changePassword(oldPassword, newPassword)
  .then(res => {
    console.log('Password changed');
  })
  .catch(err => {
    console.log(err);
  });
```

#### Social Media Authentication:
##### socialSignin (also for Signup)
Signs the user into a Back& application using a social media provider as the authentication method. This opens a dialog window supplied by the social media network provider. If the user does not have an account with the selected provider, they will be prompted to create one as a part of this process.

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| provider | string | Name of the provider to authenticate with. The full list can be obtained by calling `backand.getSocialProviders(scb)` |

###### Sample Code
```javascript
backand.socialSignin(provider)
  .then(res => {
    console.log('signin succeeded with user:' + res.data.username);
  })
  .catch(err => {
    console.log(err);
  });
```

#### CRUD:
The following methods perform create, retrieve, update, and delete functionality on a Back& object.

##### GetList
Fetches a list of records from the specified object. Uses `params` to store filter data

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| params | object | A hash of filter parameters. Allowed parameters are: `pageSize`, `pageNumber`, `filter`, `sort`, `search`, `exclude`, `deep`, `relatedObjects` |

###### Sample Code
```javascript
backand.object.getList(object, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

###### Sample Code with filter params
```javascript
let params = {
  sort: backand.helpers.sort.create('creationDate', backand.helpers.sort.orders.desc),
  exclude: backand.helpers.exclude.options.all,
  filter: backand.helpers.filter.create('user', backand.helpers.filter.operators.relation.in, userId),
  pageSize: 20,
  pageNumber: 1
};
backand.object.getList(object, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

##### GetOne

Retrieves a single record from the specified object.

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| id | integer | ID of the record to retrieve, subject to the filter specified in `params` |
| params | object | A hash of filter parameters. Allowed parameters are: `deep`, `exclude`, `level` |

###### Sample Code
```javascript
backand.object.getOne(object, id, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

##### Create

Creates a record with the provided data in the specified object

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| data | object | Data to use in the creation of the new record |
| params | object | A hash of filter parameters. Allowed parameters are: `returnObject`, `deep` |

###### Sample Code
```javascript
backand.object.create(object, data, params)
  .then(res => {
    console.log('object created');
  })
  .catch(err => {
    console.log(err);
  });
```

##### Update
Updates a record with the specified ID in the specified object with the provided data.

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| id | integer | ID of the object to update |
| data | object | Data to update the record with |
| params | object | A hash of filter parameters. Allowed parameters are: `returnObject`, `deep` |

###### Sample Code
```javascript
backand.object.update(object, id, data, params)
  .then(res => {
    console.log('object updated');
  })
  .catch(err => {
    console.log(err);
  });
```

##### Remove
Deletes a record from the specified object with the specified ID

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| id | integer | ID of the object to update |

###### Sample Code
```javascript
backand.object.remove(object, id)
  .then(res => {
    console.log('object removed');
  })
  .catch(err => {
    console.log(err);
  });
```

##### Trigger object actions (GET)
Triggers custom actions that operate via HTTP GET requests

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| action | string | Name of the action to trigger |
| params | object | Parameters for the action to operate upon |

###### Sample Code
```javascript
backand.object.action.get(object, action, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

##### Trigger object actions (POST)
Triggers custom actions that operate via HTTP POST requests

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the Back& object to work with |
| action | string | Name of the action to trigger |
| data | object | Object data to send as the body of the POST request |
| params | object | Parameters for the action to operate upon |

###### Sample Code
```javascript
backand.object.action.post(object, action, data, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

#### Socket Communications
You can easily integrate with our Socket functionality using the `on` method. Socket signin and signout are handled automatically by the SDK.

##### On
Event handler for broadcast Socket events.

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| eventName | string | Name of the socket event to subsccribe to |
| callback | function | Callback triggered when `eventName` is received |

###### Sample Code
```javascript
  //Wait for server updates on 'items' object
  Backand.on('items_updated', function (data) {
    //Get the 'items' object that have changed
    console.log(data);
  });
```

#### File
This property allows you to work with server-side actions, interacting with the related files directly. You can use this after you have finished creating a server-side action in the Back& dashboard, in the Actions tab of an object (object -> actions tab -> Backand Files icon -> name: 'files')

##### Upload
Uploads a file for a server-side action

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the object controlling the desired server-side action |
| fileAction | string | The name of the file action to work with |
| filename | string | The name of the file to upload |
| filedata | string | The file's data |

###### Sample Code
```javascript
backand.file.upload(object, 'files', filename, filedata)
  .then(res => {
    console.log('file uploaded. url: ' + res.data.url);
  })
  .catch(err => {
    console.log(err);
  });
```

##### Remove
Removes a file from a server-side action file set.

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| object | string | Name of the object controlling the desired server-side action |
| fileAction | string | The name of the file action to work with |
| filename | string | The name of the file to remove |

###### Sample Code
```javascript
backand.file.remove(object, 'files', filename)
  .then(res => {
    console.log('file deleted');
  })
  .catch(err => {
    console.log(err);
  });
```

#### User:
The `user` property returns data about the connected user (getUserDetails, getUsername, getUserRole, getToken, getRefreshToken).

##### GetUserDetails
Gets the connected user's details.

###### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| force | boolean | Forces the SDK to refresh its data from the server. **Default: FALSE** |

###### Sample Code
```javascript
backand.user.getUserDetails(force)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

#### Query:
The `query` property lets you initiate a custom Back& query using either HTTP GET or HTTP POST.

##### get
Calls a custom query using a HTTP GET

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| name | string | The name of the query to work with |
| params | object | Parameters to be passed to the query |

###### Sample Code
```javascript
backand.query.get(name, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

##### post
Calls a custom query using a HTTP POST

###### Parameters
| name | type | description |
| ---- | ---- | ----------- |
| name | string | The name of the query to work with |
| data | object | Data to be included in the body of the HTTP POST |
| params | object | Parameters to be passed to the query |

###### Sample Code
```javascript
backand.query.post(name, data, params)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.log(err);
  });
```

## Examples and further reading
***To view the demo web page, just run npm start - [example page](https://github.com/backand/vanilla-sdk/blob/master/example/).***


## License

  [MIT](LICENSE)
