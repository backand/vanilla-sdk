/***********************************************
 * backand JavaScript Library
 * Authors: backand
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Compiled At: 15/11/2016
 ***********************************************/
(function () {

  // init backand
  backand.init && backand.init({
    appName: 'sdk',
    signUpToken: '851692ae-eb94-4f18-87ee-075255e67748',
    anonymousToken: '82cfcfe8-c718-4621-8bb6-cd600e23487f',
    runSocket: true,
    // useAnonymousTokenByDefault: false,
    // storage: new backand.helpers.MemoryStorage()
  });

  var outputContainer = document.getElementById('outputContainer');
  var outputElement = document.getElementById('outputElement');
  var objectName = "items";

  var successCallback = function (response) {
      outputElement.innerText = '';
      outputContainer.classList.remove('panel-danger');
      outputContainer.classList.add('panel-success');
      outputElement.innerText = "status: " + response.status + "\n" + JSON.stringify(response.data);
  };
  var errorCallback = function (error) {
    // console.log(error);
    outputElement.innerText = '';
    outputContainer.classList.remove('panel-success');
    outputContainer.classList.add('panel-danger');
    outputElement.innerText = "status: " + error.status + "\n" + JSON.stringify(error.data);
  };

  var lastCreatedId = null;

  // LOGIN
  document.getElementById('sigin_btn').addEventListener('click', function() {
      var username = document.getElementById('sigin_user').value;
      var password = document.getElementById('sigin_pass').value;
      backand.signin(username, password).then(successCallback).catch(errorCallback);
    }, false);

  document.getElementById('anonymous_btn').addEventListener('click', function() {
      backand.useAnonymousAuth().then(successCallback).catch(errorCallback);
    }, false);

  var socialProviders = backand.constants.SOCIAL_PROVIDERS
  for (var provider in socialProviders) {
    var btn = document.createElement("button");
    var node = document.createTextNode(socialProviders[provider].label);
    btn.appendChild(node);
    btn.value = socialProviders[provider].name;
    btn.className = "btn btn-primary";
    btn.style.backgroundColor = socialProviders[provider].css.backgroundColor;
    btn.style.borderColor = socialProviders[provider].css.backgroundColor;

    btn.onclick = function(e) {
      backand.socialSignin(e.target.value).then(successCallback).catch(errorCallback);
    };

    document.getElementById('social_btns').appendChild(btn);
  }

  document.getElementById('signout_btn').addEventListener('click', function() {
      backand.signout().then(successCallback).catch(errorCallback);
    }, false);

  // CRUD
  document.getElementById('getitem_btn').disabled = true;
  document.getElementById('updateitem_btn').disabled = true;
  document.getElementById('deleteitem_btn').disabled = true;

  document.getElementById('postitem_btn').addEventListener('click', function() {
    backand.object.create(objectName, { name:'test', description:'new item' }, {returnObject: true})
    .then(function (response) {
      lastCreatedId = response.data.__metadata.id;
      document.getElementById('getitem_btn').disabled = false;
      document.getElementById('updateitem_btn').disabled = false;
      document.getElementById('deleteitem_btn').disabled = false;
      successCallback(response);
    })
    .catch(errorCallback)
  }, false);

  document.getElementById('getitems_btn').addEventListener('click', function() {
    backand.object.getList(objectName, {}).then(successCallback).catch(errorCallback);
  }, false);

  document.getElementById('getitem_btn').addEventListener('click', function() {
    backand.object.getOne(objectName, lastCreatedId, {}).then(successCallback).catch(errorCallback);
  }, false);


  document.getElementById('updateitem_btn').addEventListener('click', function() {
    backand.object.update(objectName, lastCreatedId, { name:'test', description:'old item' }, {returnObject: true})
    .then(successCallback)
    .catch(errorCallback);
  }, false);

  document.getElementById('deleteitem_btn').addEventListener('click', function() {
    backand.object.remove(objectName, lastCreatedId).then(successCallback).catch(errorCallback);
  }, false);

  // FILES
  var lastUploaded = null;
  document.getElementById('delfile_btn').disabled = true;

  document.getElementById('uploadfile_btn').addEventListener("change", function () {
    var preview = document.getElementById('preview');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.addEventListener("load", function () {
      // console.log(file);
      // console.log(reader);
      backand.file.upload('items', 'files', file.name, reader.result)
      .then(function (response) {
        preview.src = response.data.url;
        lastUploaded = file.name;
        document.getElementById('delfile_btn').disabled = false;
        successCallback(response);
      })
      .catch(errorCallback);
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }, false);

  document.getElementById('delfile_btn').addEventListener('click', function() {
    backand.file.remove('items','files', lastUploaded)
    .then(function (response) {
      preview.src = ""
      lastUploaded = null;
      document.getElementById('delfile_btn').disabled = true;
      successCallback(response);
    })
    .catch(errorCallback);
  }, false);

  // SOCKET
  backand.on('items_updated', function (data) {
    console.log('items_updated');
    console.log(data);
  });

  window.addEventListener(backand.constants.EVENTS.SIGNIN, function (e) {
    console.log(e);
  }, false);
  window.addEventListener(backand.constants.EVENTS.SIGNOUT, function (e) {
    console.log(e);
  }, false);

})();
