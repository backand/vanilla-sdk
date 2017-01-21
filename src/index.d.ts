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
  function useAnonymousAuth (): Promise<Response>;
  function signin (username: string, password: string): Promise<Response>;
  function signup (firstName: string, lastName: string, email: string, password: string, confirmPassword: string, parameters?: any): Promise<Response>;
  function socialSignin (provider: string): Promise<Response>;
  function socialSigninWithToken (provider: string, token: string): Promise<Response>;
  function socialSignup (provider: string, email: string): Promise<Response>;
  function requestResetPassword (username: string): Promise<Response>;
  function resetPassword (newPassword: string, resetToken: string): Promise<Response>;
  function changePassword (oldPassword: string, newPassword: string): Promise<Response>;
  function signout (): Promise<Response>;
  function getSocialProviders (): Promise<Response>;
  // socket
  function on (eventName: string, callback?: (response?: any) => void): void;
}
