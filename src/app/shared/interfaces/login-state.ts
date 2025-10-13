export type LoginStatus = 'pending' | 'authenticating' | 'success' | 'error';

export interface LoginState {
  status: LoginStatus;
}
