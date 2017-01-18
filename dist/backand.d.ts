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
  function useAnonymousAuth (scb?: (response?: Response)=> void): Promise<Response>;
  function signin (username: string, password: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function signup (email: string, password: string, confirmPassword: string, firstName: string, lastName: string, parameters?: any, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function socialSignin (provider: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function socialSigninWithToken (provider: string, token: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function socialSignup (provider: string, email: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function requestResetPassword (username: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function resetPassword (newPassword: string, resetToken: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function changePassword (oldPassword: string, newPassword: string, scb?: (response?: Response)=> void, ecb?: (error?: Response)=> void): Promise<Response>;
  function signout (scb?: (response?: Response)=> void): Promise<Response>;
  function getSocialProviders (scb?: (response?: Response)=> void): Promise<Response>;
  // socket
  function on (eventName: string, callback?: (response?: any) => void): void;
}
