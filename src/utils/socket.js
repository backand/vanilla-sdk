export default class Socket {
  constructor (url) {
    if (!window.io)
      throw new Error('runSocket is true but socketio-client is not included');
    this.url = url;
    this.socket = null;
  }
  on (eventName, callback) {
    this.socket.on(eventName, data => {
      callback.call(this, data);
    });
  }
  connect (token, anonymousToken, appName) {
    this.disconnect();
    this.socket = io.connect(this.url, {'forceNew':true });

    this.socket.on('connect', () => {
      console.info(`trying to establish a socket connection to ${appName} ...`);
      this.socket.emit("login", token, anonymousToken, appName);
    });

    this.socket.on('authorized', () => {
      console.info(`socket connected`);
    });

    this.socket.on('notAuthorized', () => {
      setTimeout(() => this.disconnect(), 1000);
    });

    this.socket.on('disconnect', () => {
      console.info(`socket disconnect`);
    });

    this.socket.on('reconnecting', () => {
      console.info(`socket reconnecting`);
    });

    this.socket.on('error', (error) => {
      console.warn(`error: ${error}`);
    });
  }
  disconnect () {
    if (this.socket) {
      this.socket.close();
    }
  }
}
