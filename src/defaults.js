export default {
  appName: null,
  anonymousToken: null,
  useAnonymousTokenByDefault: true,
  signUpToken: null,
  masterToken: null,
  userToken: null,

  apiUrl: 'https://api.backand.com', // debug
  exportUtils: false, // debug

  storage: {},
  storagePrefix: 'BACKAND_',

  manageRefreshToken: true,
  runSigninAfterSignup: true,

  runSocket: false,
  socketUrl: 'https://socket.backand.com', // debug

  isMobile: false,
  mobilePlatform: 'ionic',

  runOffline: false,
  allowUpdatesinOfflineMode: false,
  beforeExecuteOfflineItem: (request) => {
    return true
  },
  afterExecuteOfflineItem: (response, request) => {
  },
};
