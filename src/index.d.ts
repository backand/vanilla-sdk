// Type definitions for vanillabknd-sdk 1.1.0
// Project: Backand SDK's
// Definitions by: Ran Cohen

declare class Response {
  status: number;
  statusText: string;
  headers: any;
  config: any;
  data: any;
}

export = backand;
export as namespace backand;

declare namespace backand {
  function init(config: any): void;
  let constants: any;
  let helpers: any;
  let defaults: any;
  let object: any;
  let file: any;
  let query: any;
  let user: any;
  // auth
  function useAnonymousAuth (): any;
  function signin (username: string, password: string): any;
  function signup (firstName: string, lastName: string, email: string, password: string, confirmPassword: string, parameters?: any): any;
  function socialSignin (provider: string): any;
  function socialSigninWithToken (provider: string, token: string): any;
  function socialSignup (provider: string, email: string): any;
  function requestResetPassword (username: string): any;
  function resetPassword (newPassword: string, resetToken: string): any;
  function changePassword (oldPassword: string, newPassword: string): any;
  function signout (): any;
  function getSocialProviders (): any;
  // socket
  function on (eventName: string, callback?: (response?: any) => void): void;
}
